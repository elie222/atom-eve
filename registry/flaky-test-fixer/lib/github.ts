const DEFAULT_GITHUB_API_URL = "https://api.github.com";

export const reviewCiRunsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lookbackRuns: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description:
        "Number of most recent workflow runs to analyze. Defaults to FLAKY_TEST_LOOKBACK_RUNS or 50."
    },
    branch: {
      type: "string",
      minLength: 1,
      description: "Restrict analysis to a single head branch. Defaults to FLAKY_TEST_BRANCH or all branches."
    },
    workflow: {
      type: "string",
      minLength: 1,
      description: "Case-insensitive substring filter on workflow name or path. Defaults to no filter."
    }
  }
} as const;

export interface ReviewCiRunsInput {
  lookbackRuns?: number;
  branch?: string;
  workflow?: string;
}

export interface CiRunReport {
  generatedAt: string;
  source: "github-actions";
  repo: string;
  branch: string | null;
  runsAnalyzed: number;
  summary: {
    totalWorkflows: number;
    likelyFlakes: number;
    likelyBroken: number;
    healthy: number;
    retriedRuns: number;
  };
  workflows: WorkflowFlakeReport[];
  notes: string[];
}

export interface WorkflowFlakeReport {
  workflow: string;
  path: string | null;
  htmlUrl: string | null;
  totalRuns: number;
  completedRuns: number;
  failures: number;
  successes: number;
  retriedRuns: number;
  failureRatePct: number | null;
  mixedCommits: string[];
  classification: "likely-flake" | "likely-broken" | "healthy" | "unknown";
  confidence: "high" | "medium" | "low";
  evidence: string[];
  fixPlan: string[];
}

interface GithubConfig {
  token: string;
  repo: string;
  baseUrl: string;
}

interface WorkflowRun {
  name?: string;
  path?: string;
  head_sha?: string;
  head_branch?: string;
  status?: string;
  conclusion?: string | null;
  run_attempt?: number;
  html_url?: string;
  created_at?: string;
}

interface RunsResponse {
  workflow_runs?: WorkflowRun[];
}

interface WorkflowAccumulator {
  workflow: string;
  path: string | null;
  htmlUrl: string | null;
  totalRuns: number;
  failures: number;
  successes: number;
  retriedRuns: number;
  shaConclusions: Map<string, Set<"failure" | "success">>;
}

const FAILURE_CONCLUSIONS = new Set(["failure", "timed_out", "startup_failure"]);

export async function reviewCiRuns(
  input: ReviewCiRunsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<CiRunReport> {
  const parsed = normalizeReviewCiRunsInput(input);
  const config = getGithubConfig();
  const lookbackRuns = parsed.lookbackRuns ?? Number(process.env.FLAKY_TEST_LOOKBACK_RUNS ?? 50);
  const branch = parsed.branch ?? process.env.FLAKY_TEST_BRANCH ?? null;
  const workflowFilter = parsed.workflow?.toLowerCase() ?? null;

  const runs = await fetchWorkflowRuns(config, { lookbackRuns, branch }, fetchImpl);
  const accumulators = new Map<string, WorkflowAccumulator>();
  let runsAnalyzed = 0;

  for (const run of runs) {
    const name = run.name ?? run.path ?? "Unnamed workflow";
    const path = run.path ?? null;
    if (workflowFilter && !`${name} ${path ?? ""}`.toLowerCase().includes(workflowFilter)) continue;
    runsAnalyzed += 1;

    const key = `${name}::${path ?? ""}`;
    const acc =
      accumulators.get(key) ??
      {
        workflow: name,
        path,
        htmlUrl: run.html_url ?? null,
        totalRuns: 0,
        failures: 0,
        successes: 0,
        retriedRuns: 0,
        shaConclusions: new Map<string, Set<"failure" | "success">>()
      };

    acc.totalRuns += 1;
    if ((run.run_attempt ?? 1) > 1) acc.retriedRuns += 1;

    if (run.status === "completed") {
      const outcome = classifyConclusion(run.conclusion);
      if (outcome) {
        if (outcome === "failure") acc.failures += 1;
        else acc.successes += 1;
        const sha = run.head_sha;
        if (sha) {
          const set = acc.shaConclusions.get(sha) ?? new Set<"failure" | "success">();
          set.add(outcome);
          acc.shaConclusions.set(sha, set);
        }
      }
    }

    accumulators.set(key, acc);
  }

  const workflows = [...accumulators.values()]
    .map((acc) => buildWorkflowReport(acc))
    .sort(
      (a, b) =>
        classificationRank(b.classification) - classificationRank(a.classification) ||
        b.failures - a.failures
    );

  return {
    generatedAt: new Date().toISOString(),
    source: "github-actions",
    repo: config.repo,
    branch,
    runsAnalyzed,
    summary: {
      totalWorkflows: workflows.length,
      likelyFlakes: workflows.filter((w) => w.classification === "likely-flake").length,
      likelyBroken: workflows.filter((w) => w.classification === "likely-broken").length,
      healthy: workflows.filter((w) => w.classification === "healthy").length,
      retriedRuns: workflows.reduce((total, w) => total + w.retriedRuns, 0)
    },
    workflows,
    notes: [
      "Read-only run: no workflow re-runs were triggered, and no commits, pull requests, branches, or issues were created.",
      "Flake signals are heuristic. A re-run that later passed on the same commit, or an intermittent pass/fail pattern, points to a flake; a workflow that fails on every recent run is more likely a real break.",
      "Diagnoses are scoped to recent runs from the GitHub Actions runs endpoint. Inspect the linked job logs before quarantining or retrying any test."
    ]
  };
}

export function normalizeReviewCiRunsInput(input: unknown): ReviewCiRunsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Flaky test review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    lookbackRuns: optionalInteger(value.lookbackRuns, "lookbackRuns", 1, 100),
    branch: optionalString(value.branch, "branch"),
    workflow: optionalString(value.workflow, "workflow")
  };
}

function getGithubConfig(): GithubConfig {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPO are required");
  }
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error("GITHUB_REPO must be in 'owner/repo' format");
  }

  return {
    token,
    repo,
    baseUrl: (process.env.GITHUB_API_URL ?? DEFAULT_GITHUB_API_URL).replace(/\/$/, "")
  };
}

async function fetchWorkflowRuns(
  config: GithubConfig,
  options: { lookbackRuns: number; branch: string | null },
  fetchImpl: typeof fetch
): Promise<WorkflowRun[]> {
  const url = new URL(`${config.baseUrl}/repos/${config.repo}/actions/runs`);
  url.searchParams.set("per_page", String(Math.min(Math.max(options.lookbackRuns, 1), 100)));
  if (options.branch) url.searchParams.set("branch", options.branch);

  const response = await fetchImpl(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${config.token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `GitHub API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await response.json()) as RunsResponse;
  return payload.workflow_runs ?? [];
}

function classifyConclusion(conclusion: string | null | undefined): "failure" | "success" | null {
  if (!conclusion) return null;
  if (conclusion === "success") return "success";
  if (FAILURE_CONCLUSIONS.has(conclusion)) return "failure";
  return null;
}

function buildWorkflowReport(acc: WorkflowAccumulator): WorkflowFlakeReport {
  const completedRuns = acc.failures + acc.successes;
  const failureRatePct = completedRuns === 0 ? null : Math.round((acc.failures / completedRuns) * 100);
  const mixedCommits = [...acc.shaConclusions.entries()]
    .filter(([, outcomes]) => outcomes.has("failure") && outcomes.has("success"))
    .map(([sha]) => sha);

  const { classification, confidence } = classifyWorkflow(acc, completedRuns, mixedCommits);

  return {
    workflow: acc.workflow,
    path: acc.path,
    htmlUrl: acc.htmlUrl,
    totalRuns: acc.totalRuns,
    completedRuns,
    failures: acc.failures,
    successes: acc.successes,
    retriedRuns: acc.retriedRuns,
    failureRatePct,
    mixedCommits,
    classification,
    confidence,
    evidence: buildEvidence(acc, completedRuns, failureRatePct, mixedCommits),
    fixPlan: buildFixPlan(acc, classification)
  };
}

function classifyWorkflow(
  acc: WorkflowAccumulator,
  completedRuns: number,
  mixedCommits: string[]
): { classification: WorkflowFlakeReport["classification"]; confidence: WorkflowFlakeReport["confidence"] } {
  if (completedRuns === 0) return { classification: "unknown", confidence: "low" };
  if (acc.failures === 0) return { classification: "healthy", confidence: completedRuns >= 3 ? "high" : "low" };
  if (acc.successes === 0) {
    return { classification: "likely-broken", confidence: completedRuns >= 3 ? "high" : "medium" };
  }
  if (mixedCommits.length > 0 || acc.retriedRuns > 0) {
    return { classification: "likely-flake", confidence: "high" };
  }
  return { classification: "likely-flake", confidence: "medium" };
}

function buildEvidence(
  acc: WorkflowAccumulator,
  completedRuns: number,
  failureRatePct: number | null,
  mixedCommits: string[]
): string[] {
  const evidence = [
    `${acc.failures} failed / ${acc.successes} passed across ${completedRuns} completed run(s) (${acc.totalRuns} total).`
  ];
  if (failureRatePct !== null) evidence.push(`Failure rate ${failureRatePct}% over the analyzed window.`);
  if (acc.retriedRuns > 0) {
    evidence.push(`${acc.retriedRuns} run(s) were re-run (run_attempt > 1) — a common manual-flake signal.`);
  }
  if (mixedCommits.length > 0) {
    evidence.push(
      `${mixedCommits.length} commit(s) both failed and passed without code changes (e.g. ${mixedCommits[0]}).`
    );
  }
  return evidence;
}

function buildFixPlan(acc: WorkflowAccumulator, classification: WorkflowFlakeReport["classification"]): string[] {
  const logsHint = acc.htmlUrl
    ? `Open the latest job logs (${acc.htmlUrl}) and isolate which test or step is non-deterministic.`
    : "Open the latest job logs in GitHub Actions and isolate which test or step is non-deterministic.";

  if (classification === "likely-broken") {
    return [
      logsHint,
      `Treat "${acc.workflow}" as a genuine failure, not a flake: it failed on every recent completed run.`,
      "Reproduce locally, write or run a failing test for the broken path, then implement the smallest fix.",
      "No changes were pushed by this run; raise the fix through your normal review flow."
    ];
  }

  if (classification === "likely-flake") {
    return [
      logsHint,
      `Re-run the suspect test locally many times (and with randomized order) to reproduce the intermittent failure in "${acc.workflow}".`,
      "Look for shared state, timing/sleep assumptions, network or clock dependence, and test ordering as flake root causes.",
      "If confirmed flaky, propose quarantining or making the test deterministic and open a tracking issue — this run made no code or CI changes."
    ];
  }

  return [
    logsHint,
    `"${acc.workflow}" looks healthy in the analyzed window; keep monitoring before taking action.`
  ];
}

function classificationRank(classification: WorkflowFlakeReport["classification"]): number {
  return { "likely-flake": 4, "likely-broken": 3, unknown: 2, healthy: 1 }[classification];
}

function optionalInteger(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (!Number.isInteger(value) || (value as number) < min || (value as number) > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return value as number;
}

function optionalString(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || value.length === 0) {
    throw new Error(`${field} must be a non-empty string.`);
  }
  return value;
}
