export interface GithubIssue {
  number: number;
  title: string;
  state: string;
  url: string;
  author: string;
  labels: string[];
  commentCount: number;
  reactions: number;
  createdAt: string;
  updatedAt: string;
  excerpt: string;
}

export interface IssueSweepNote {
  number: number;
  title: string;
  severity: "info" | "watch" | "action";
  sweepHint: string;
}

export interface RecentIssuesReview {
  generatedAt: string;
  mode: "read_only_audit";
  repo: string;
  issues: GithubIssue[];
  sweepNotes: IssueSweepNote[];
  auditHint: string;
}

export const reviewRecentIssuesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    state: {
      type: "string",
      enum: ["open", "closed", "all"],
      description: "Which issue states to read. Defaults to open."
    },
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum number of issues to read (1-100). Defaults to 30."
    },
    since: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "Only read issues updated on or after this UTC date in YYYY-MM-DD format."
    }
  }
} as const;

export interface ReviewRecentIssuesInput {
  state?: "open" | "closed" | "all";
  limit?: number;
  since?: string;
}

export function normalizeReviewRecentIssuesInput(input: unknown): ReviewRecentIssuesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Feedback Sweep review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    state: optionalState(value.state),
    limit: optionalLimit(value.limit),
    since: optionalDate(value.since, "since")
  };
}

export async function reviewRecentIssues(
  input: ReviewRecentIssuesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<RecentIssuesReview> {
  const parsed = normalizeReviewRecentIssuesInput(input);
  const repo = requireRepo();
  const issues = await fetchRecentIssues(parsed, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_audit",
    repo,
    issues,
    sweepNotes: buildSweepNotes(issues),
    auditHint:
      "Treat each issue as a user correction or complaint. Search this project for every related spot that shares the same root cause (other call sites, copy, docs, tests, similar components) and present a project-wide list of places to fix. This is a read-only audit: propose fixes for operator review, do not edit code, close issues, or comment."
  };
}

export async function fetchRecentIssues(
  input: ReviewRecentIssuesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<GithubIssue[]> {
  const token = process.env.GITHUB_TOKEN;
  const repo = requireRepo();
  if (!token) throw new Error("GITHUB_TOKEN is required");

  const url = new URL(`https://api.github.com/repos/${repo}/issues`);
  url.searchParams.set("state", input.state ?? "open");
  url.searchParams.set("per_page", String(input.limit ?? 30));
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");
  if (input.since) url.searchParams.set("since", `${input.since}T00:00:00Z`);

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "atom-eve-feedback-sweep"
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `GitHub API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await response.json()) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];

  return rows
    // The issues endpoint also returns pull requests; keep real issues only.
    .filter((row) => row.pull_request === undefined)
    .map((row) => ({
      number: Number(row.number ?? 0),
      title: String(row.title ?? "Untitled issue"),
      state: String(row.state ?? "open"),
      url: String(row.html_url ?? ""),
      author: String((row.user as { login?: unknown } | undefined)?.login ?? "unknown"),
      labels: extractLabels(row.labels),
      commentCount: Number(row.comments ?? 0),
      reactions: Number((row.reactions as { total_count?: unknown } | undefined)?.total_count ?? 0),
      createdAt: String(row.created_at ?? ""),
      updatedAt: String(row.updated_at ?? ""),
      excerpt: excerpt(row.body)
    }));
}

export function buildSweepNotes(issues: GithubIssue[]): IssueSweepNote[] {
  return issues.map((issue) => {
    const labels = issue.labels.map((label) => label.toLowerCase());
    const looksLikeBug = labels.some((label) =>
      ["bug", "regression", "broken", "defect", "incorrect"].some((needle) => label.includes(needle))
    );

    if (looksLikeBug) {
      return {
        number: issue.number,
        title: issue.title,
        severity: "action",
        sweepHint:
          "Reported as a defect. Trace the root cause, then sweep the codebase for every other spot with the same pattern and list each as a candidate fix for operator review."
      };
    }

    if (issue.reactions >= 5 || issue.commentCount >= 5) {
      return {
        number: issue.number,
        title: issue.title,
        severity: "watch",
        sweepHint:
          "High engagement suggests a widely felt problem. Identify related areas that likely share the same root cause and list them for operator review."
      };
    }

    return {
      number: issue.number,
      title: issue.title,
      severity: "info",
      sweepHint:
        "Review for any related spots in the project, then note possible fixes for operator review."
    };
  });
}

function requireRepo(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO is required (format: owner/repo)");
  return repo;
}

function extractLabels(labels: unknown): string[] {
  if (!Array.isArray(labels)) return [];
  return labels
    .map((label) => {
      if (typeof label === "string") return label;
      if (label && typeof label === "object") return String((label as { name?: unknown }).name ?? "");
      return "";
    })
    .filter((label) => label.length > 0);
}

function excerpt(body: unknown): string {
  if (typeof body !== "string") return "";
  const trimmed = body.trim().replace(/\s+/g, " ");
  return trimmed.length > 280 ? `${trimmed.slice(0, 280)}…` : trimmed;
}

function optionalState(value: unknown): "open" | "closed" | "all" | undefined {
  if (value === undefined) return undefined;
  if (value !== "open" && value !== "closed" && value !== "all") {
    throw new Error("state must be one of: open, closed, all.");
  }
  return value;
}

function optionalLimit(value: unknown): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 1 || value > 100) {
    throw new Error("limit must be an integer between 1 and 100.");
  }
  return value;
}

function optionalDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must be a YYYY-MM-DD date string.`);
  }
  return value;
}
