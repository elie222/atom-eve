// Read-only GitHub pull request reader for this project's adversarial reviewer agent.
// It GETs a single pull request plus its unified diff so the agent can form an independent,
// skeptical second-opinion review. It never approves, merges, comments, or changes anything.

export interface PullRequestSummary {
  number: number;
  title: string;
  state: string;
  author: string;
  baseBranch: string;
  headBranch: string;
  draft: boolean;
  additions: number;
  deletions: number;
  changedFiles: number;
  mergeable: boolean | null;
  body: string;
  url: string;
}

export interface PullRequestReview {
  generatedAt: string;
  mode: "read_only_review";
  repo: string;
  pullRequest: PullRequestSummary;
  diffFiles: string[];
  diff: string;
  diffTruncated: boolean;
  reviewChecklist: string[];
  reviewHint: string;
}

// Diffs can be large; cap what we hand back to the model and flag truncation explicitly.
const MAX_DIFF_CHARS = 60_000;

export const reviewPullRequestInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["prNumber"],
  properties: {
    prNumber: {
      type: "integer",
      minimum: 1,
      description: "The pull request number to review (read-only)."
    }
  }
} as const;

export interface ReviewPullRequestInput {
  prNumber: number;
}

export function normalizeReviewPullRequestInput(input: unknown): ReviewPullRequestInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Pull request review input must be an object with a prNumber.");
  }

  const value = input as Record<string, unknown>;
  const prNumber = value.prNumber;
  if (typeof prNumber !== "number" || !Number.isInteger(prNumber) || prNumber < 1) {
    throw new Error("prNumber must be a positive integer.");
  }

  return { prNumber };
}

export async function reviewPullRequest(
  input: ReviewPullRequestInput,
  fetchImpl: typeof fetch = fetch
): Promise<PullRequestReview> {
  const { prNumber } = normalizeReviewPullRequestInput(input);
  const repo = requireRepo();

  const [pullRequest, rawDiff] = await Promise.all([
    fetchPullRequest(repo, prNumber, fetchImpl),
    fetchPullRequestDiff(repo, prNumber, fetchImpl)
  ]);

  const diffTruncated = rawDiff.length > MAX_DIFF_CHARS;
  const diff = diffTruncated ? rawDiff.slice(0, MAX_DIFF_CHARS) : rawDiff;

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_review",
    repo,
    pullRequest,
    diffFiles: parseChangedFiles(rawDiff),
    diff,
    diffTruncated,
    reviewChecklist: REVIEW_CHECKLIST,
    reviewHint:
      "Form an independent, skeptical second opinion. Surface the highest-impact objections first " +
      "(correctness, security, data loss, breaking changes, missing tests) and separate blocking " +
      "concerns from nits. This is a read-only review: present objections for the author to weigh; " +
      "do not approve, merge, comment, or claim any change was made."
  };
}

const REVIEW_CHECKLIST = [
  "Correctness: does the diff actually do what the PR title and body claim?",
  "Edge cases: null/empty/large inputs, concurrency, and error paths that are silently swallowed.",
  "Security: injection, authz/authn gaps, secret handling, and unsafe deserialization.",
  "Data safety: irreversible migrations, destructive operations, and missing backups or guards.",
  "Breaking changes: API/contract/schema changes and backward compatibility.",
  "Tests: are the risky paths covered, or is coverage asserted but absent?",
  "Scope: unrelated changes, dead code, or hidden behavior changes bundled in."
];

export async function fetchPullRequest(
  repo: string,
  prNumber: number,
  fetchImpl: typeof fetch = fetch
): Promise<PullRequestSummary> {
  const response = await fetchImpl(
    `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
    { headers: githubHeaders("application/vnd.github+json") }
  );
  if (!response.ok) {
    throw await githubError("pull request", response);
  }

  const row = (await response.json()) as Record<string, unknown>;
  const head = (row.head ?? {}) as Record<string, unknown>;
  const base = (row.base ?? {}) as Record<string, unknown>;
  const user = (row.user ?? {}) as Record<string, unknown>;

  return {
    number: Number(row.number ?? prNumber),
    title: String(row.title ?? "Untitled pull request"),
    state: String(row.state ?? "unknown"),
    author: String(user.login ?? "unknown"),
    baseBranch: String(base.ref ?? ""),
    headBranch: String(head.ref ?? ""),
    draft: Boolean(row.draft),
    additions: Number(row.additions ?? 0),
    deletions: Number(row.deletions ?? 0),
    changedFiles: Number(row.changed_files ?? 0),
    mergeable: typeof row.mergeable === "boolean" ? row.mergeable : null,
    body: row.body == null ? "" : String(row.body),
    url: String(row.html_url ?? "")
  };
}

export async function fetchPullRequestDiff(
  repo: string,
  prNumber: number,
  fetchImpl: typeof fetch = fetch
): Promise<string> {
  const response = await fetchImpl(
    `https://api.github.com/repos/${repo}/pulls/${prNumber}`,
    { headers: githubHeaders("application/vnd.github.v3.diff") }
  );
  if (!response.ok) {
    throw await githubError("pull request diff", response);
  }
  return response.text();
}

function parseChangedFiles(diff: string): string[] {
  const files: string[] = [];
  for (const line of diff.split("\n")) {
    if (!line.startsWith("diff --git ")) continue;
    const match = /^diff --git a\/.+ b\/(.+)$/.exec(line);
    if (match) files.push(match[1]);
  }
  return files;
}

function requireRepo(): string {
  const repo = process.env.GITHUB_REPO;
  if (!repo) throw new Error("GITHUB_REPO is required (format: owner/repo).");
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error(`GITHUB_REPO must be in owner/repo format, got "${repo}".`);
  }
  return repo;
}

function githubHeaders(accept: string): Record<string, string> {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN is required.");
  return {
    Authorization: `Bearer ${token}`,
    Accept: accept,
    "User-Agent": "atom-eve-adversarial-reviewer",
    "X-GitHub-Api-Version": "2022-11-28"
  };
}

async function githubError(label: string, response: Response): Promise<Error> {
  const body = await response.text().catch(() => "");
  return new Error(
    `GitHub API failed reading ${label}: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
  );
}
