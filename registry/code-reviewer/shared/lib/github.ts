// Read-only GitHub pull request reviewer. Lists open pull requests for the configured repo,
// reads each PR's changed files/diff, and returns per-PR review notes flagging correctness and
// simplification issues. This module never posts comments, approves, merges, or mutates anything.

const GITHUB_API = "https://api.github.com";

export interface PullRequestFile {
  filename: string;
  status: string;
  additions: number;
  deletions: number;
  changes: number;
  patch: string | null;
}

export interface PullRequestReviewNote {
  category: "correctness" | "simplification";
  severity: "info" | "watch" | "action";
  note: string;
}

export interface PullRequestReview {
  number: number;
  title: string;
  author: string;
  url: string;
  isDraft: boolean;
  changedFiles: number;
  additions: number;
  deletions: number;
  files: PullRequestFile[];
  notes: PullRequestReviewNote[];
}

export interface OpenPullRequestsReview {
  generatedAt: string;
  mode: "read_only_review";
  repo: string;
  pullRequests: PullRequestReview[];
  reviewHint: string;
}

interface RawPullRequest {
  number: number;
  title: string;
  html_url: string;
  draft?: boolean;
  user?: { login?: string } | null;
}

export const reviewPullRequestsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 30,
      description: "Maximum number of open pull requests to review, newest updated first. Defaults to 10."
    }
  }
} as const;

export interface ReviewPullRequestsInput {
  limit?: number;
}

export function normalizeReviewPullRequestsInput(input: unknown): ReviewPullRequestsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Code review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.limit === undefined) return {};
  if (typeof value.limit !== "number" || !Number.isInteger(value.limit) || value.limit < 1 || value.limit > 30) {
    throw new Error("limit must be an integer between 1 and 30.");
  }
  return { limit: value.limit };
}

export async function reviewOpenPullRequests(
  input: ReviewPullRequestsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<OpenPullRequestsReview> {
  const parsed = normalizeReviewPullRequestsInput(input);
  const repo = requireRepo();
  const limit = parsed.limit ?? 10;

  const pulls = await fetchOpenPullRequests(repo, limit, fetchImpl);
  const pullRequests = await Promise.all(
    pulls.map(async (pull) => {
      const files = await fetchPullRequestFiles(repo, pull.number, fetchImpl);
      return buildReview(pull, files);
    })
  );

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_review",
    repo,
    pullRequests,
    reviewHint:
      "These notes are read-only drafts. Present them for the author to act on; do not post comments, approve, or merge any pull request without an explicit write tool and operator sign-off."
  };
}

export async function fetchOpenPullRequests(
  repo: string,
  limit: number,
  fetchImpl: typeof fetch = fetch
): Promise<RawPullRequest[]> {
  const url = new URL(`${GITHUB_API}/repos/${repo}/pulls`);
  url.searchParams.set("state", "open");
  url.searchParams.set("sort", "updated");
  url.searchParams.set("direction", "desc");
  url.searchParams.set("per_page", String(limit));

  const payload = (await getJson(url, fetchImpl)) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  return rows.map((row) => ({
    number: Number(row.number ?? 0),
    title: String(row.title ?? "Untitled pull request"),
    html_url: String(row.html_url ?? ""),
    draft: Boolean(row.draft),
    user: (row.user as { login?: string } | null | undefined) ?? null
  }));
}

export async function fetchPullRequestFiles(
  repo: string,
  pullNumber: number,
  fetchImpl: typeof fetch = fetch
): Promise<PullRequestFile[]> {
  const url = new URL(`${GITHUB_API}/repos/${repo}/pulls/${pullNumber}/files`);
  url.searchParams.set("per_page", "100");

  const payload = (await getJson(url, fetchImpl)) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  return rows.map((row) => ({
    filename: String(row.filename ?? ""),
    status: String(row.status ?? ""),
    additions: Number(row.additions ?? 0),
    deletions: Number(row.deletions ?? 0),
    changes: Number(row.changes ?? 0),
    patch: row.patch == null ? null : String(row.patch)
  }));
}

function buildReview(pull: RawPullRequest, files: PullRequestFile[]): PullRequestReview {
  const additions = files.reduce((sum, file) => sum + file.additions, 0);
  const deletions = files.reduce((sum, file) => sum + file.deletions, 0);

  return {
    number: pull.number,
    title: pull.title,
    author: pull.user?.login ?? "unknown",
    url: pull.html_url,
    isDraft: Boolean(pull.draft),
    changedFiles: files.length,
    additions,
    deletions,
    files,
    notes: reviewPullRequestFiles(files)
  };
}

export function reviewPullRequestFiles(files: PullRequestFile[]): PullRequestReviewNote[] {
  const notes: PullRequestReviewNote[] = [];
  const totalChanges = files.reduce((sum, file) => sum + file.changes, 0);
  const touchesTests = files.some((file) => /(test|spec|__tests__)/i.test(file.filename));
  const touchesSource = files.some((file) => /\.(t|j)sx?$/i.test(file.filename) && !/(test|spec|__tests__)/i.test(file.filename));

  if (totalChanges > 800) {
    notes.push({
      category: "simplification",
      severity: "action",
      note: `This pull request changes ${totalChanges} lines across ${files.length} files. Consider splitting it into smaller, independently reviewable changes.`
    });
  } else if (totalChanges > 400) {
    notes.push({
      category: "simplification",
      severity: "watch",
      note: `This pull request is fairly large (${totalChanges} changed lines). Confirm the scope is cohesive and not bundling unrelated work.`
    });
  }

  if (touchesSource && !touchesTests) {
    notes.push({
      category: "correctness",
      severity: "watch",
      note: "Source files changed but no test or spec files were touched. Verify the behavior change is covered by tests."
    });
  }

  for (const file of files) {
    const added = addedLines(file.patch);

    if (added.some((line) => /\b(console\.log|debugger)\b/.test(line))) {
      notes.push({
        category: "correctness",
        severity: "action",
        note: `${file.filename}: leftover debugging statement (console.log/debugger) in the diff. Remove it before merging.`
      });
    }

    if (added.some((line) => /\b(TODO|FIXME|XXX)\b/.test(line))) {
      notes.push({
        category: "correctness",
        severity: "watch",
        note: `${file.filename}: a TODO/FIXME was added. Confirm it is tracked or resolve it before merging.`
      });
    }

    if (added.some((line) => /:\s*any\b|<any>|as any\b/.test(line))) {
      notes.push({
        category: "simplification",
        severity: "watch",
        note: `${file.filename}: an \`any\` type was introduced. Prefer a precise type so the change stays self-documenting.`
      });
    }

    if (file.changes > 300) {
      notes.push({
        category: "simplification",
        severity: "watch",
        note: `${file.filename} alone changes ${file.changes} lines. Check whether it can be decomposed or whether generated output is being committed.`
      });
    }
  }

  if (notes.length === 0) {
    notes.push({
      category: "correctness",
      severity: "info",
      note: "No automated flags. Do a focused manual read for edge cases, error handling, and naming."
    });
  }

  return notes;
}

function addedLines(patch: string | null): string[] {
  if (!patch) return [];
  return patch
    .split("\n")
    .filter((line) => line.startsWith("+") && !line.startsWith("+++"))
    .map((line) => line.slice(1));
}

async function getJson(url: URL, fetchImpl: typeof fetch): Promise<unknown> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required");

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "atom-eve-code-reviewer"
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`GitHub API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }
  return response.json();
}

function requireRepo(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO is required (format: owner/repo)");
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error("GITHUB_REPO must be in owner/repo format");
  }
  return repo;
}
