export type ExperimentStatus = "draft" | "running" | "complete" | "archived";

export interface ExperimentVariant {
  key: string;
  probability: number | null;
}

export interface ExperimentSummary {
  id: number;
  name: string;
  featureFlagKey: string | null;
  status: ExperimentStatus;
  startDate: string | null;
  endDate: string | null;
  significant: boolean | null;
  significanceCode: string | null;
  winner: string | null;
  variants: ExperimentVariant[];
}

export interface ExperimentRecommendation {
  id: number;
  name: string;
  severity: "info" | "watch" | "action";
  recommendation: string;
}

interface RawExperiment {
  id?: unknown;
  name?: unknown;
  feature_flag_key?: unknown;
  start_date?: unknown;
  end_date?: unknown;
  archived?: unknown;
  parameters?: { feature_flag_variants?: Array<{ key?: unknown }> };
}

interface RawResults {
  significant?: unknown;
  significance_code?: unknown;
  probability?: Record<string, unknown>;
}

export const reviewExperimentsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    status: {
      type: "string",
      enum: ["all", "running", "complete"],
      description: "Which experiments to review: all, running, or complete. Defaults to all."
    }
  }
} as const;

export interface ReviewExperimentsInput {
  status?: "all" | "running" | "complete";
}

export function normalizeReviewExperimentsInput(input: unknown): ReviewExperimentsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Experiment review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.status !== undefined) {
    if (value.status !== "all" && value.status !== "running" && value.status !== "complete") {
      throw new Error("status must be one of: all, running, complete.");
    }
  }

  return {
    status: value.status as ReviewExperimentsInput["status"]
  };
}

export async function reviewExperiments(input: ReviewExperimentsInput = {}) {
  const parsed = normalizeReviewExperimentsInput(input);
  const statusFilter = parsed.status ?? "all";
  const experiments = await fetchExperiments();
  const filtered = experiments.filter((experiment) => {
    if (statusFilter === "all") return true;
    return experiment.status === statusFilter;
  });

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_recommendations",
    projectId: process.env.POSTHOG_PROJECT_ID ?? null,
    statusFilter,
    experiments: filtered,
    recommendations: recommendExperimentActions(filtered),
    runHistoryHint:
      "Save this response with prior weekly runs if you want to track how experiments progressed toward significance over time."
  };
}

export async function fetchExperiments(fetchImpl: typeof fetch = fetch): Promise<ExperimentSummary[]> {
  const apiKey = process.env.POSTHOG_API_KEY;
  const projectId = process.env.POSTHOG_PROJECT_ID;
  if (!apiKey || !projectId) {
    throw new Error("POSTHOG_API_KEY and POSTHOG_PROJECT_ID are required");
  }

  const host = (process.env.POSTHOG_HOST ?? "https://us.posthog.com").replace(/\/+$/, "");
  const url = new URL(`${host}/api/projects/${projectId}/experiments/`);
  url.searchParams.set("limit", "100");

  const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${apiKey}` } });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`PostHog API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { results?: RawExperiment[] };
  const raw = payload.results ?? [];

  return Promise.all(raw.map((experiment) => normalizeExperiment(experiment, host, projectId, apiKey, fetchImpl)));
}

async function normalizeExperiment(
  raw: RawExperiment,
  host: string,
  projectId: string,
  apiKey: string,
  fetchImpl: typeof fetch
): Promise<ExperimentSummary> {
  const id = Number(raw.id ?? 0);
  const status = deriveStatus(raw);
  const results = status === "draft" || status === "archived"
    ? null
    : await fetchExperimentResults(id, host, projectId, apiKey, fetchImpl);

  const probabilities = results?.probability ?? {};
  const declaredVariants = Array.isArray(raw.parameters?.feature_flag_variants)
    ? raw.parameters!.feature_flag_variants!.map((variant) => String(variant?.key ?? ""))
    : [];
  const variantKeys = declaredVariants.length > 0 ? declaredVariants : Object.keys(probabilities);

  const variants: ExperimentVariant[] = variantKeys.map((key) => ({
    key,
    probability: key in probabilities ? Number(probabilities[key]) : null
  }));

  const significant = results ? Boolean(results.significant) : null;
  const winner = significant ? pickWinner(variants) : null;

  return {
    id,
    name: String(raw.name ?? "Untitled experiment"),
    featureFlagKey: raw.feature_flag_key === undefined || raw.feature_flag_key === null
      ? null
      : String(raw.feature_flag_key),
    status,
    startDate: raw.start_date === undefined || raw.start_date === null ? null : String(raw.start_date),
    endDate: raw.end_date === undefined || raw.end_date === null ? null : String(raw.end_date),
    significant,
    significanceCode: results?.significance_code === undefined || results?.significance_code === null
      ? null
      : String(results.significance_code),
    winner,
    variants
  };
}

async function fetchExperimentResults(
  id: number,
  host: string,
  projectId: string,
  apiKey: string,
  fetchImpl: typeof fetch
): Promise<RawResults | null> {
  try {
    const url = new URL(`${host}/api/projects/${projectId}/experiments/${id}/results/`);
    const response = await fetchImpl(url, { headers: { Authorization: `Bearer ${apiKey}` } });
    if (!response.ok) return null;
    const payload = (await response.json()) as RawResults;
    const probability: Record<string, unknown> =
      payload.probability && typeof payload.probability === "object" ? payload.probability : {};
    return {
      significant: payload.significant,
      significance_code: payload.significance_code,
      probability
    };
  } catch {
    return null;
  }
}

export function recommendExperimentActions(experiments: ExperimentSummary[]): ExperimentRecommendation[] {
  return experiments.map((experiment) => {
    if (experiment.significant && experiment.winner) {
      return {
        id: experiment.id,
        name: experiment.name,
        severity: "action",
        recommendation: `Reached significance with "${experiment.winner}" ahead. Roll out the winning variant after operator review; no feature flags were changed.`
      };
    }

    if (experiment.status === "running") {
      return {
        id: experiment.id,
        name: experiment.name,
        severity: "watch",
        recommendation:
          "Still running without a significant result. Keep collecting data and do not call a winner yet."
      };
    }

    if (experiment.status === "complete") {
      return {
        id: experiment.id,
        name: experiment.name,
        severity: "info",
        recommendation:
          "Ended without a significant winner. Document the learning and avoid shipping either variant on this result alone."
      };
    }

    return {
      id: experiment.id,
      name: experiment.name,
      severity: "info",
      recommendation:
        experiment.status === "draft"
          ? "Not started yet. Confirm the hypothesis, metric, and required sample size before launching."
          : "Archived experiment. No action needed beyond keeping the recorded learning."
    };
  });
}

function deriveStatus(raw: RawExperiment): ExperimentStatus {
  if (raw.archived === true) return "archived";
  if (raw.end_date !== undefined && raw.end_date !== null) return "complete";
  if (raw.start_date !== undefined && raw.start_date !== null) return "running";
  return "draft";
}

function pickWinner(variants: ExperimentVariant[]): string | null {
  let winner: ExperimentVariant | null = null;
  for (const variant of variants) {
    if (variant.probability === null) continue;
    if (winner === null || variant.probability > (winner.probability ?? -1)) {
      winner = variant;
    }
  }
  return winner ? winner.key : null;
}
