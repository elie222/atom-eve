const GITHUB_API = "https://api.github.com";

export interface GithubCommit {
  sha: string;
  message: string;
  url: string;
  changedFiles: string[];
}

export interface MergedPullRequest {
  number: number;
  title: string;
  url: string;
  mergedAt: string;
}

export interface DocDriftFlag {
  docPath: string;
  severity: "info" | "watch" | "action";
  reason: string;
  relatedChanges: string[];
}

export interface DocsSyncReview {
  generatedAt: string;
  mode: "read_only_draft";
  repo: string;
  lookbackDays: number;
  commitsReviewed: number;
  pullRequestsReviewed: number;
  recentPullRequests: MergedPullRequest[];
  codeChanges: string[];
  docChanges: string[];
  driftFlags: DocDriftFlag[];
  proposedUpdate: string;
  reviewHint: string;
}

export const reviewRecentChangesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lookbackDays: {
      type: "integer",
      minimum: 1,
      maximum: 90,
      description: "How many days of recent commits and merged pull requests to inspect. Defaults to 7."
    }
  }
} as const;

export interface ReviewRecentChangesInput {
  lookbackDays?: number;
}

export function normalizeReviewRecentChangesInput(input: unknown): ReviewRecentChangesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Docs Sync review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.lookbackDays !== undefined) {
    if (typeof value.lookbackDays !== "number" || !Number.isInteger(value.lookbackDays)) {
      throw new Error("lookbackDays must be an integer number of days.");
    }
    if (value.lookbackDays < 1 || value.lookbackDays > 90) {
      throw new Error("lookbackDays must be between 1 and 90.");
    }
  }

  return { lookbackDays: value.lookbackDays as number | undefined };
}

// Read-only review: reads recent commits and merged pull requests, then flags docs that have
// likely drifted from the code and proposes a reviewable doc update. It never opens a pull
// request or edits any file.
export async function reviewRecentChanges(
  input: ReviewRecentChangesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<DocsSyncReview> {
  const parsed = normalizeReviewRecentChangesInput(input);
  const lookbackDays = parsed.lookbackDays ?? 7;
  const repo = requireRepo();
  const since = new Date(Date.now() - lookbackDays * 24 * 60 * 60 * 1000).toISOString();

  const [commits, mergedPulls] = await Promise.all([
    fetchRecentCommits(repo, since, fetchImpl),
    fetchMergedPullRequests(repo, since, fetchImpl)
  ]);

  const changedFiles = new Set<string>();
  for (const commit of commits) {
    for (const file of commit.changedFiles) changedFiles.add(file);
  }
  const allFiles = [...changedFiles].sort();
  const docChanges = allFiles.filter(isDocFile);
  const codeChanges = allFiles.filter((file) => !isDocFile(file));
  const driftFlags = flagDocDrift(codeChanges, docChanges);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    repo,
    lookbackDays,
    commitsReviewed: commits.length,
    pullRequestsReviewed: mergedPulls.length,
    recentPullRequests: mergedPulls.slice(0, 10),
    codeChanges,
    docChanges,
    driftFlags,
    proposedUpdate: buildProposedUpdate(repo, codeChanges, docChanges, driftFlags),
    reviewHint:
      "Present the proposed documentation update as a reviewable draft for operator approval. Do not open a pull request or edit any file unless a separate write tool confirms the action."
  };
}

export async function fetchRecentCommits(
  repo: string,
  since: string,
  fetchImpl: typeof fetch = fetch,
  maxCommits = 15
): Promise<GithubCommit[]> {
  const listUrl = new URL(`${GITHUB_API}/repos/${repo}/commits`);
  listUrl.searchParams.set("since", since);
  listUrl.searchParams.set("per_page", String(maxCommits));
  const list = await githubGet<RawCommitListItem[]>(listUrl, fetchImpl);

  return Promise.all(
    list.slice(0, maxCommits).map(async (item) => {
      const detail = await githubGet<RawCommitDetail>(
        new URL(`${GITHUB_API}/repos/${repo}/commits/${item.sha}`),
        fetchImpl
      );
      return {
        sha: item.sha,
        message: firstLine(item.commit?.message ?? ""),
        url: item.html_url ?? "",
        changedFiles: (detail.files ?? []).map((file) => file.filename).filter(Boolean)
      };
    })
  );
}

export async function fetchMergedPullRequests(
  repo: string,
  since: string,
  fetchImpl: typeof fetch = fetch
): Promise<MergedPullRequest[]> {
  const url = new URL(`${GITHUB_API}/repos/${repo}/pulls`);
  url.searchParams.set("state", "closed");
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", "30");
  const list = await githubGet<RawPullRequest[]>(url, fetchImpl);

  const sinceMs = new Date(since).getTime();
  return list
    .filter((pr) => pr.merged_at !== null && new Date(pr.merged_at).getTime() >= sinceMs)
    .map((pr) => ({
      number: pr.number,
      title: pr.title ?? "Untitled pull request",
      url: pr.html_url ?? "",
      mergedAt: pr.merged_at as string
    }));
}

export function flagDocDrift(codeChanges: string[], docChanges: string[]): DocDriftFlag[] {
  if (codeChanges.length === 0) {
    return [
      {
        docPath: "README.md",
        severity: "info",
        reason: "No code changes were found in this window, so documentation is unlikely to have drifted.",
        relatedChanges: []
      }
    ];
  }

  const apiSurfaceChanges = codeChanges.filter(isApiSurface);

  if (apiSurfaceChanges.length > 0 && docChanges.length === 0) {
    return [
      {
        docPath: "README.md",
        severity: "action",
        reason:
          "Public API, schema, or configuration surface changed but no documentation was updated in this window. Review the affected docs and refresh them.",
        relatedChanges: apiSurfaceChanges.slice(0, 10)
      }
    ];
  }

  if (docChanges.length === 0) {
    return [
      {
        docPath: "README.md",
        severity: "watch",
        reason:
          "Code changed in this window with no accompanying documentation changes. Confirm the README and guides still match current behavior.",
        relatedChanges: codeChanges.slice(0, 10)
      }
    ];
  }

  return [
    {
      docPath: docChanges[0],
      severity: "info",
      reason:
        "Documentation was updated alongside code in this window. Spot-check that every code change is reflected in the docs.",
      relatedChanges: codeChanges.slice(0, 10)
    }
  ];
}

function buildProposedUpdate(
  repo: string,
  codeChanges: string[],
  docChanges: string[],
  driftFlags: DocDriftFlag[]
): string {
  const lines = [
    `# Proposed documentation update for ${repo}`,
    "",
    "This is a draft for operator review. No pull request was opened and no file was changed.",
    "",
    "## Why this is proposed",
    ...driftFlags.map((flag) => `- [${flag.severity}] ${flag.docPath}: ${flag.reason}`),
    "",
    "## Code changes to reflect",
    ...(codeChanges.length > 0
      ? codeChanges.slice(0, 15).map((file) => `- ${file}`)
      : ["- None in this window."]),
    "",
    "## Docs already touched",
    ...(docChanges.length > 0 ? docChanges.map((file) => `- ${file}`) : ["- None in this window."]),
    "",
    "## Suggested next step",
    "Edit the flagged docs to describe the changed behavior, then open a pull request yourself after review."
  ];
  return lines.join("\n");
}

function isDocFile(file: string): boolean {
  const lower = file.toLowerCase();
  if (/\.(md|mdx|rst|txt|adoc)$/.test(lower)) return true;
  if (lower.includes("docs/") || lower.includes("documentation/")) return true;
  const base = lower.split("/").pop() ?? lower;
  return base.startsWith("readme") || base.startsWith("changelog");
}

function isApiSurface(file: string): boolean {
  const lower = file.toLowerCase();
  if (/(^|\/)(package\.json|pyproject\.toml|go\.mod|cargo\.toml)$/.test(lower)) return true;
  if (/(openapi|swagger)/.test(lower)) return true;
  if (/\.(proto|graphql)$/.test(lower)) return true;
  if (/schema/.test(lower)) return true;
  return lower.includes("/api/") || lower.includes("/routes/");
}

function firstLine(message: string): string {
  return message.split("\n")[0]?.trim() ?? "";
}

function requireRepo(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO is required (owner/repo).");
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error("GITHUB_REPO must be in owner/repo format.");
  }
  return repo;
}

async function githubGet<T>(url: URL, fetchImpl: typeof fetch): Promise<T> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "atom-eve-docs-sync"
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }
  return (await response.json()) as T;
}

interface RawCommitListItem {
  sha: string;
  commit?: { message?: string };
  html_url?: string;
}

interface RawCommitDetail {
  files?: Array<{ filename: string }>;
}

interface RawPullRequest {
  number: number;
  title?: string;
  html_url?: string;
  merged_at: string | null;
}
