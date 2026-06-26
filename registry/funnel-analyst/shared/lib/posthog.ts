export type RetentionPeriod = "Hour" | "Day" | "Week" | "Month";

export interface FunnelStep {
  order: number;
  name: string;
  count: number;
  conversionRateFromPrevious: number | null;
  conversionRateFromStart: number | null;
  dropOffFromPrevious: number;
}

export interface FunnelDropOff {
  fromStep: string;
  toStep: string;
  dropOffCount: number;
  dropOffPct: number | null;
}

export interface RetentionPoint {
  period: number;
  retainedPct: number | null;
}

export interface RetentionSummary {
  period: RetentionPeriod;
  event: string;
  points: RetentionPoint[];
}

export interface FunnelRecommendation {
  severity: "info" | "watch" | "action";
  recommendation: string;
}

export interface FunnelReview {
  generatedAt: string;
  mode: "read_only_recommendations";
  dateRange: { dateFrom: string };
  steps: FunnelStep[];
  biggestDropOff: FunnelDropOff | null;
  retention: RetentionSummary | null;
  recommendations: FunnelRecommendation[];
  credentialsConfigured: boolean;
  runHistoryHint: string;
}

const RETENTION_PERIODS: readonly RetentionPeriod[] = ["Hour", "Day", "Week", "Month"];

// Generic default funnel using PostHog built-in events. The agent normally supplies the real
// product funnel steps in the tool input; this default keeps the tool runnable without arguments.
const DEFAULT_STEPS: readonly string[] = ["$pageview", "$identify"];

export const reviewFunnelsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    steps: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      description:
        "Ordered PostHog event names that define the funnel steps. Defaults to a pageview-to-identify funnel."
    },
    dateFrom: {
      type: "string",
      description:
        "PostHog relative or absolute window start, e.g. -7d or -30d. Defaults to -7d."
    },
    retentionEvent: {
      type: "string",
      description: "Event name used for the retention/cohort view. Defaults to the final funnel step."
    },
    retentionPeriod: {
      type: "string",
      enum: ["Hour", "Day", "Week", "Month"],
      description: "Retention bucket size. Defaults to Week."
    }
  }
} as const;

export interface ReviewFunnelsInput {
  steps?: string[];
  dateFrom?: string;
  retentionEvent?: string;
  retentionPeriod?: RetentionPeriod;
}

export function normalizeReviewFunnelsInput(input: unknown): ReviewFunnelsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Funnel review input must be an object.");
  }

  const value = input as Record<string, unknown>;

  let steps: string[] | undefined;
  if (value.steps !== undefined) {
    if (!Array.isArray(value.steps) || value.steps.some((step) => typeof step !== "string")) {
      throw new Error("steps must be an array of event-name strings.");
    }
    if (value.steps.length < 2) {
      throw new Error("steps must contain at least two event names.");
    }
    steps = value.steps as string[];
  }

  if (value.dateFrom !== undefined && typeof value.dateFrom !== "string") {
    throw new Error("dateFrom must be a string.");
  }
  if (value.retentionEvent !== undefined && typeof value.retentionEvent !== "string") {
    throw new Error("retentionEvent must be a string.");
  }

  const period = value.retentionPeriod;
  if (period !== undefined && !RETENTION_PERIODS.includes(period as RetentionPeriod)) {
    throw new Error("retentionPeriod must be one of Hour, Day, Week, Month.");
  }

  return {
    steps,
    dateFrom: value.dateFrom as string | undefined,
    retentionEvent: value.retentionEvent as string | undefined,
    retentionPeriod: period as RetentionPeriod | undefined
  };
}

export async function reviewFunnels(
  input: ReviewFunnelsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<FunnelReview> {
  const parsed = normalizeReviewFunnelsInput(input);
  const steps = parsed.steps ?? [...DEFAULT_STEPS];
  const dateFrom = parsed.dateFrom ?? "-7d";
  const retentionPeriod = parsed.retentionPeriod ?? "Week";
  const retentionEvent = parsed.retentionEvent ?? steps[steps.length - 1];

  const [funnelSteps, retention] = await Promise.all([
    fetchFunnel(steps, dateFrom, fetchImpl),
    fetchRetention(retentionEvent, retentionPeriod, fetchImpl)
  ]);

  const drop = biggestDropOff(funnelSteps);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_recommendations",
    dateRange: { dateFrom },
    steps: funnelSteps,
    biggestDropOff: drop,
    retention,
    recommendations: recommendFunnelActions(funnelSteps, drop),
    credentialsConfigured: Boolean(process.env.POSTHOG_API_KEY && process.env.POSTHOG_PROJECT_ID),
    runHistoryHint:
      "Save this response alongside prior weekly runs to track how funnel conversion and retention shift over time."
  };
}

export async function fetchFunnel(
  steps: string[],
  dateFrom: string,
  fetchImpl: typeof fetch = fetch
): Promise<FunnelStep[]> {
  const query = {
    kind: "FunnelsQuery",
    series: steps.map((event) => ({ kind: "EventsNode", event })),
    dateRange: { date_from: dateFrom }
  };

  const payload = (await runQuery(query, fetchImpl)) as { results?: Array<Record<string, unknown>> };
  const rows = Array.isArray(payload.results) ? payload.results : [];
  const firstCount = Number(rows[0]?.count ?? 0);

  return rows.map((row, index) => {
    const count = Number(row.count ?? 0);
    const previousCount = index > 0 ? Number(rows[index - 1]?.count ?? 0) : count;
    return {
      order: Number(row.order ?? index),
      name: String(row.name ?? row.custom_name ?? steps[index] ?? `Step ${index + 1}`),
      count,
      conversionRateFromPrevious: index === 0 ? null : percentOf(count, previousCount),
      conversionRateFromStart: index === 0 ? null : percentOf(count, firstCount),
      dropOffFromPrevious: index === 0 ? 0 : Math.max(previousCount - count, 0)
    };
  });
}

export async function fetchRetention(
  event: string,
  period: RetentionPeriod,
  fetchImpl: typeof fetch = fetch
): Promise<RetentionSummary> {
  const query = {
    kind: "RetentionQuery",
    retentionFilter: {
      targetEntity: { id: event, name: event, type: "events" },
      returningEntity: { id: event, name: event, type: "events" },
      period,
      totalIntervals: 8
    }
  };

  const payload = (await runQuery(query, fetchImpl)) as { results?: Array<Record<string, unknown>> };
  const rows = Array.isArray(payload.results) ? payload.results : [];
  const first = rows[0] as { values?: Array<Record<string, unknown>> } | undefined;
  const values = Array.isArray(first?.values) ? first.values : [];
  const base = Number(values[0]?.count ?? 0);

  const points: RetentionPoint[] = values.map((value, index) => ({
    period: index,
    retainedPct: percentOf(Number(value.count ?? 0), base)
  }));

  return { period, event, points };
}

export function recommendFunnelActions(
  steps: FunnelStep[],
  biggest: FunnelDropOff | null
): FunnelRecommendation[] {
  if (steps.length === 0) {
    return [
      {
        severity: "info",
        recommendation:
          "No funnel data was returned for this window. Confirm the event names and date range, then re-run. No changes were made."
      }
    ];
  }

  const recommendations: FunnelRecommendation[] = [];

  if (biggest && (biggest.dropOffPct ?? 0) >= 60) {
    recommendations.push({
      severity: "action",
      recommendation:
        `The largest drop-off is between "${biggest.fromStep}" and "${biggest.toStep}" (${biggest.dropOffPct}% lost). ` +
        "Investigate this transition first for friction, slow load, or an unclear next step. No changes were made."
    });
  } else if (biggest && (biggest.dropOffPct ?? 0) >= 30) {
    recommendations.push({
      severity: "watch",
      recommendation:
        `The largest drop-off is between "${biggest.fromStep}" and "${biggest.toStep}" (${biggest.dropOffPct}% lost). ` +
        "Worth a closer look at this step. No changes were made."
    });
  } else {
    recommendations.push({
      severity: "info",
      recommendation:
        "No single step is leaking a large share of users. Keep monitoring and consider testing incremental improvements."
    });
  }

  const overall = steps[steps.length - 1]?.conversionRateFromStart ?? null;
  if (overall !== null && overall < 5) {
    recommendations.push({
      severity: "watch",
      recommendation:
        `End-to-end conversion is ${overall}%. Confirm the funnel definition matches the intended user journey before drawing conclusions.`
    });
  }

  return recommendations;
}

function biggestDropOff(steps: FunnelStep[]): FunnelDropOff | null {
  let best: FunnelDropOff | null = null;
  for (let index = 1; index < steps.length; index += 1) {
    const previous = steps[index - 1];
    const current = steps[index];
    const candidate: FunnelDropOff = {
      fromStep: previous.name,
      toStep: current.name,
      dropOffCount: current.dropOffFromPrevious,
      dropOffPct: percentOf(current.dropOffFromPrevious, previous.count)
    };
    if (!best || candidate.dropOffCount > best.dropOffCount) {
      best = candidate;
    }
  }
  return best;
}

async function runQuery(query: unknown, fetchImpl: typeof fetch): Promise<unknown> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("POSTHOG_API_KEY and POSTHOG_PROJECT_ID are required");
  }

  const host = (process.env.POSTHOG_HOST ?? "https://us.posthog.com").replace(/\/+$/, "");
  const response = await fetchImpl(`${host}/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `PostHog API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  return response.json();
}

function percentOf(numerator: number, denominator: number): number | null {
  if (denominator === 0) return numerator === 0 ? 0 : null;
  return Math.round((numerator / denominator) * 1000) / 10;
}
