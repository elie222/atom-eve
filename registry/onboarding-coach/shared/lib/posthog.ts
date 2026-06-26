export interface ActivationStep {
  step: number;
  event: string;
  usersReached: number;
  droppedFromPrevious: number;
  dropOffPct: number | null;
}

export interface ActivationNudge {
  step: number;
  event: string;
  severity: "info" | "watch" | "action";
  nudge: string;
}

export interface ActivationReview {
  generatedAt: string;
  mode: "read_only_draft";
  lookbackDays: number;
  steps: ActivationStep[];
  recommendations: ActivationNudge[];
  draftingHint: string;
}

const DEFAULT_STEPS = ["signed_up", "onboarding_started", "key_feature_used", "activated"];
const DEFAULT_LOOKBACK_DAYS = 7;

export const reviewActivationInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    steps: {
      type: "array",
      items: { type: "string" },
      minItems: 2,
      description:
        "Ordered onboarding event names from first touch to activation. Defaults to a generic signup-to-activation funnel."
    },
    lookbackDays: {
      type: "integer",
      minimum: 1,
      maximum: 90,
      description: "How many days of events to inspect. Defaults to 7."
    }
  }
} as const;

export interface ReviewActivationInput {
  steps?: string[];
  lookbackDays?: number;
}

export function normalizeReviewActivationInput(input: unknown): ReviewActivationInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Activation review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  const result: ReviewActivationInput = {};

  if (value.steps !== undefined) {
    if (!Array.isArray(value.steps) || value.steps.some((step) => typeof step !== "string")) {
      throw new Error("steps must be an array of event-name strings.");
    }
    const steps = (value.steps as string[]).map((step) => step.trim()).filter((step) => step.length > 0);
    if (steps.length < 2) {
      throw new Error("steps must list at least two onboarding events in order.");
    }
    result.steps = steps;
  }

  if (value.lookbackDays !== undefined) {
    if (typeof value.lookbackDays !== "number" || !Number.isInteger(value.lookbackDays) || value.lookbackDays < 1) {
      throw new Error("lookbackDays must be a positive integer.");
    }
    result.lookbackDays = value.lookbackDays;
  }

  return result;
}

export async function reviewActivation(
  input: ReviewActivationInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<ActivationReview> {
  const steps = input.steps ?? DEFAULT_STEPS;
  const lookbackDays = input.lookbackDays ?? DEFAULT_LOOKBACK_DAYS;
  const counts = await fetchStepCounts(steps, lookbackDays, fetchImpl);
  const activationSteps = buildSteps(steps, counts);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    lookbackDays,
    steps: activationSteps,
    recommendations: recommendNudges(activationSteps),
    draftingHint:
      "Draft one nudge per step where users are dropping off. Present each draft with the onboarding step it targets and the trigger condition for operator approval. This is read-only analysis; do not send messages, change feature flags, or modify PostHog."
  };
}

export async function fetchStepCounts(
  steps: string[],
  lookbackDays: number,
  fetchImpl: typeof fetch = fetch
): Promise<Map<string, number>> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("POSTHOG_API_KEY and POSTHOG_PROJECT_ID are required");
  }

  const eventList = steps.map((event) => `'${event.replace(/'/g, "\\'")}'`).join(", ");
  const hogql =
    `SELECT event, count(DISTINCT person_id) AS users FROM events ` +
    `WHERE event IN (${eventList}) AND timestamp >= now() - INTERVAL ${lookbackDays} DAY ` +
    `GROUP BY event`;

  const response = await fetchImpl(`https://us.posthog.com/api/projects/${projectId}/query/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ query: { kind: "HogQLQuery", query: hogql } })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`PostHog query API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { results?: unknown };
  const rows = Array.isArray(payload.results) ? (payload.results as unknown[]) : [];
  const counts = new Map<string, number>();
  for (const row of rows) {
    if (!Array.isArray(row) || row.length < 2) continue;
    counts.set(String(row[0]), Number(row[1] ?? 0));
  }
  return counts;
}

function buildSteps(steps: string[], counts: Map<string, number>): ActivationStep[] {
  let previousUsers: number | null = null;
  return steps.map((event, index) => {
    const usersReached = counts.get(event) ?? 0;
    const droppedFromPrevious = previousUsers === null ? 0 : Math.max(previousUsers - usersReached, 0);
    const dropOffPct =
      previousUsers === null || previousUsers === 0
        ? null
        : Math.round((droppedFromPrevious / previousUsers) * 1000) / 10;
    previousUsers = usersReached;
    return { step: index + 1, event, usersReached, droppedFromPrevious, dropOffPct };
  });
}

export function recommendNudges(steps: ActivationStep[]): ActivationNudge[] {
  return steps.map((step) => {
    if (step.dropOffPct === null) {
      return {
        step: step.step,
        event: step.event,
        severity: "info",
        nudge:
          `Entry step "${step.event}". No upstream drop-off to nudge here. Use this as the baseline cohort for the steps below.`
      };
    }

    if (step.dropOffPct >= 50) {
      return {
        step: step.step,
        event: step.event,
        severity: "action",
        nudge:
          `${step.dropOffPct}% of users who reached the prior step never fire "${step.event}". Draft a focused nudge that walks them through this step and links straight to the action.`
      };
    }

    if (step.dropOffPct >= 25) {
      return {
        step: step.step,
        event: step.event,
        severity: "watch",
        nudge:
          `${step.dropOffPct}% drop-off before "${step.event}". Draft a lighter reminder highlighting the value of completing this step, and review the in-product copy.`
      };
    }

    return {
      step: step.step,
      event: step.event,
      severity: "info",
      nudge: `Healthy progression into "${step.event}" (${step.dropOffPct}% drop-off). Keep monitoring; no nudge needed yet.`
    };
  });
}
