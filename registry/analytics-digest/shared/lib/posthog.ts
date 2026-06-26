export interface EventTrend {
  event: string;
  count: number;
  previousCount: number;
  changePct: number | null;
  shareOfTotalPct: number | null;
}

export interface TrendObservation {
  event: string;
  severity: "info" | "watch" | "action";
  observation: string;
}

export interface DateRange {
  since: string;
  until: string;
}

export interface TrendsReview {
  generatedAt: string;
  mode: "read_only_digest";
  dataWindow: {
    current: DateRange;
    comparison: DateRange;
  };
  totalEvents: number;
  previousTotalEvents: number;
  trends: EventTrend[];
  observations: TrendObservation[];
  digestHint: string;
}

export const reviewTrendsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    asOf: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "Inclusive UTC end date of the reporting window in YYYY-MM-DD format. Defaults to today."
    },
    windowDays: {
      type: "integer",
      minimum: 1,
      maximum: 90,
      description: "Number of days in each comparison window. Defaults to 7."
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum number of distinct events to include. Defaults to 25."
    }
  }
} as const;

export interface ReviewTrendsInput {
  asOf?: string;
  windowDays?: number;
  limit?: number;
}

export function normalizeReviewTrendsInput(input: unknown): ReviewTrendsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Analytics digest review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    asOf: optionalDate(value.asOf, "asOf"),
    windowDays: optionalInt(value.windowDays, "windowDays", 1, 90),
    limit: optionalInt(value.limit, "limit", 1, 100)
  };
}

export async function reviewTrends(
  input: ReviewTrendsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<TrendsReview> {
  const parsed = normalizeReviewTrendsInput(input);
  const asOf = parsed.asOf ?? offsetDate(0);
  const windowDays = parsed.windowDays ?? 7;
  const limit = parsed.limit ?? 25;

  // Windows are half-open on the end: [since, until) using whole UTC days.
  const currentUntil = shiftDate(asOf, 1);
  const currentSince = shiftDate(currentUntil, -windowDays);
  const comparisonUntil = currentSince;
  const comparisonSince = shiftDate(comparisonUntil, -windowDays);

  const currentRange: DateRange = { since: currentSince, until: currentUntil };
  const comparisonRange: DateRange = { since: comparisonSince, until: comparisonUntil };

  const [current, previous] = await Promise.all([
    fetchEventCounts(currentRange, limit, fetchImpl),
    fetchEventCounts(comparisonRange, limit, fetchImpl)
  ]);

  const trends = mergeTrends(current, previous, limit);
  const totalEvents = sumCounts(current);
  const previousTotalEvents = sumCounts(previous);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_digest",
    dataWindow: {
      current: currentRange,
      comparison: comparisonRange
    },
    totalEvents,
    previousTotalEvents,
    trends,
    observations: observeTrends(trends, totalEvents),
    digestHint:
      "Turn these trends into a short plain-language weekly digest for the team. Lead with the headline movement, explain what likely changed, and flag anything worth investigating. This is read-only: do not claim to have changed tracking, dashboards, or any PostHog configuration."
  };
}

interface EventCount {
  event: string;
  count: number;
}

export async function fetchEventCounts(
  range: DateRange,
  limit = 25,
  fetchImpl: typeof fetch = fetch
): Promise<EventCount[]> {
  const query =
    `SELECT event, count() AS total FROM events ` +
    `WHERE timestamp >= toDateTime('${range.since} 00:00:00') ` +
    `AND timestamp < toDateTime('${range.until} 00:00:00') ` +
    `GROUP BY event ORDER BY total DESC LIMIT ${limit}`;

  const rows = await runHogQLQuery(query, fetchImpl);
  return rows.map((row) => ({
    event: String(row[0] ?? "unknown"),
    count: Number(row[1] ?? 0)
  }));
}

async function runHogQLQuery(query: string, fetchImpl: typeof fetch): Promise<unknown[][]> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("POSTHOG_API_KEY and POSTHOG_PROJECT_ID are required");
  }
  const host = (process.env.POSTHOG_HOST ?? "https://us.posthog.com").replace(/\/$/, "");

  const response = await fetchImpl(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query } })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`PostHog query API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { results?: unknown };
  const results = Array.isArray(payload.results) ? payload.results : [];
  return results.map((row) => (Array.isArray(row) ? (row as unknown[]) : [row]));
}

function mergeTrends(current: EventCount[], previous: EventCount[], limit: number): EventTrend[] {
  const previousByEvent = new Map(previous.map((item) => [item.event, item.count]));
  const total = sumCounts(current);

  return current.slice(0, limit).map((item) => {
    const previousCount = previousByEvent.get(item.event) ?? 0;
    return {
      event: item.event,
      count: item.count,
      previousCount,
      changePct: percentChange(item.count, previousCount),
      shareOfTotalPct: total > 0 ? Math.round((item.count / total) * 1000) / 10 : null
    };
  });
}

export function observeTrends(trends: EventTrend[], totalEvents: number): TrendObservation[] {
  return trends.map((item) => {
    const change = item.changePct;
    const material = item.count >= 50 || (item.shareOfTotalPct ?? 0) >= 5;

    if (material && change !== null && change <= -25) {
      return {
        event: item.event,
        severity: "action",
        observation:
          `"${item.event}" dropped ${Math.abs(change)}% versus the prior window. Investigate a possible tracking regression, release, or genuine usage decline.`
      };
    }

    if (material && change !== null && change >= 50) {
      return {
        event: item.event,
        severity: "watch",
        observation:
          `"${item.event}" rose ${change}% versus the prior window. Confirm whether this reflects real growth or duplicate/instrumentation changes before celebrating.`
      };
    }

    if (item.previousCount > 0 && item.count === 0) {
      return {
        event: item.event,
        severity: "action",
        observation:
          `"${item.event}" had ${item.previousCount} events last window but zero this window. Likely a broken or removed event; verify instrumentation.`
      };
    }

    return {
      event: item.event,
      severity: "info",
      observation:
        `"${item.event}" is steady (${item.count} events, ${item.shareOfTotalPct ?? 0}% of the ${totalEvents} tracked). No action needed.`
    };
  });
}

function sumCounts(items: EventCount[]): number {
  return items.reduce((acc, item) => acc + item.count, 0);
}

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function offsetDate(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function optionalDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must be a YYYY-MM-DD date string.`);
  }
  return value;
}

function optionalInt(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return value;
}
