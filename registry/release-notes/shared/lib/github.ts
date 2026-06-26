export type ReleaseNoteType = "feature" | "fix" | "performance" | "refactor" | "docs" | "other";

export interface MergedPullRequest {
  number: number;
  title: string;
  url: string;
  author: string;
  mergedAt: string | null;
  labels: string[];
  type: ReleaseNoteType;
}

export interface ReleaseNoteGroup {
  type: ReleaseNoteType;
  heading: string;
  pullRequests: MergedPullRequest[];
}

export interface ReleaseNotesReview {
  generatedAt: string;
  mode: "read_only_draft";
  repo: string;
  sinceRef: string | null;
  sinceDate: string | null;
  totalMergedPullRequests: number;
  groups: ReleaseNoteGroup[];
  draftingHint: string;
}

export const reviewMergedPullRequestsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    sinceTag: {
      type: "string",
      description:
        "Tag or release name to collect merged pull requests since. Defaults to the latest published release, then the most recent tag."
    }
  }
} as const;

export interface ReviewMergedPullRequestsInput {
  sinceTag?: string;
}

export function normalizeReviewMergedPullRequestsInput(input: unknown): ReviewMergedPullRequestsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Release notes review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.sinceTag !== undefined && typeof value.sinceTag !== "string") {
    throw new Error("sinceTag must be a string.");
  }
  return { sinceTag: value.sinceTag };
}

export async function reviewMergedPullRequests(
  input: ReviewMergedPullRequestsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<ReleaseNotesReview> {
  const parsed = normalizeReviewMergedPullRequestsInput(input);
  const { token, repo } = readConfig();

  const since = await resolveSinceRef(repo, parsed.sinceTag, token, fetchImpl);
  const pullRequests = await fetchMergedPullRequests(repo, since.date, token, fetchImpl);
  const groups = groupPullRequests(pullRequests);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    repo,
    sinceRef: since.ref,
    sinceDate: since.date,
    totalMergedPullRequests: pullRequests.length,
    groups,
    draftingHint:
      "Draft user-facing release notes from these grouped pull requests. Lead with Features, then Bug Fixes, then the rest, and write in plain language for end users. Present the notes as a draft for operator approval; do not publish a release or create a tag."
  };
}

export async function fetchMergedPullRequests(
  repo: string,
  sinceDate: string | null,
  token: string,
  fetchImpl: typeof fetch = fetch
): Promise<MergedPullRequest[]> {
  const qualifiers = [`repo:${repo}`, "is:pr", "is:merged"];
  if (sinceDate) qualifiers.push(`merged:>${sinceDate}`);

  const url = new URL("https://api.github.com/search/issues");
  url.searchParams.set("q", qualifiers.join(" "));
  url.searchParams.set("sort", "updated");
  url.searchParams.set("order", "desc");
  url.searchParams.set("per_page", "100");

  const response = await githubFetch(url, token, fetchImpl);
  if (!response.ok) {
    throw await apiError(response, "GitHub search");
  }

  const payload = (await response.json()) as { items?: Array<Record<string, unknown>> };
  return (payload.items ?? []).map(toMergedPullRequest);
}

const TYPE_ORDER: Array<{ type: ReleaseNoteType; heading: string }> = [
  { type: "feature", heading: "Features" },
  { type: "fix", heading: "Bug Fixes" },
  { type: "performance", heading: "Performance" },
  { type: "refactor", heading: "Refactors" },
  { type: "docs", heading: "Documentation" },
  { type: "other", heading: "Other Changes" }
];

export function groupPullRequests(pullRequests: MergedPullRequest[]): ReleaseNoteGroup[] {
  return TYPE_ORDER.map(({ type, heading }) => ({
    type,
    heading,
    pullRequests: pullRequests.filter((pr) => pr.type === type)
  })).filter((group) => group.pullRequests.length > 0);
}

interface SinceRef {
  ref: string | null;
  date: string | null;
}

async function resolveSinceRef(
  repo: string,
  sinceTag: string | undefined,
  token: string,
  fetchImpl: typeof fetch
): Promise<SinceRef> {
  if (sinceTag) {
    return { ref: sinceTag, date: await fetchRefDate(repo, sinceTag, token, fetchImpl) };
  }

  const releaseResponse = await githubFetch(`https://api.github.com/repos/${repo}/releases/latest`, token, fetchImpl);
  if (releaseResponse.ok) {
    const release = (await releaseResponse.json()) as {
      tag_name?: unknown;
      published_at?: unknown;
      created_at?: unknown;
    };
    const ref = release.tag_name ? String(release.tag_name) : null;
    const date = release.published_at
      ? String(release.published_at)
      : release.created_at
        ? String(release.created_at)
        : ref
          ? await fetchRefDate(repo, ref, token, fetchImpl)
          : null;
    return { ref, date };
  }
  if (releaseResponse.status !== 404) {
    throw await apiError(releaseResponse, "GitHub releases");
  }

  const tagsResponse = await githubFetch(`https://api.github.com/repos/${repo}/tags?per_page=1`, token, fetchImpl);
  if (!tagsResponse.ok) {
    throw await apiError(tagsResponse, "GitHub tags");
  }
  const tags = (await tagsResponse.json()) as Array<{ name?: unknown }>;
  const first = Array.isArray(tags) ? tags[0] : undefined;
  if (!first?.name) {
    return { ref: null, date: null };
  }
  const ref = String(first.name);
  return { ref, date: await fetchRefDate(repo, ref, token, fetchImpl) };
}

async function fetchRefDate(
  repo: string,
  ref: string,
  token: string,
  fetchImpl: typeof fetch
): Promise<string | null> {
  const response = await githubFetch(
    `https://api.github.com/repos/${repo}/commits/${encodeURIComponent(ref)}`,
    token,
    fetchImpl
  );
  if (!response.ok) {
    if (response.status === 404) return null;
    throw await apiError(response, "GitHub commit lookup");
  }
  const payload = (await response.json()) as {
    commit?: { committer?: { date?: unknown }; author?: { date?: unknown } };
  };
  const date = payload.commit?.committer?.date ?? payload.commit?.author?.date;
  return date ? String(date) : null;
}

function toMergedPullRequest(row: Record<string, unknown>): MergedPullRequest {
  const labels = Array.isArray(row.labels)
    ? (row.labels as Array<Record<string, unknown>>).map((label) => String(label.name ?? "")).filter(Boolean)
    : [];
  const title = String(row.title ?? "");
  const user = row.user as { login?: unknown } | undefined;
  const pullRequest = row.pull_request as { merged_at?: unknown } | undefined;

  return {
    number: Number(row.number ?? 0),
    title,
    url: String(row.html_url ?? ""),
    author: user?.login ? String(user.login) : "unknown",
    mergedAt: pullRequest?.merged_at ? String(pullRequest.merged_at) : null,
    labels,
    type: classifyPullRequest(title, labels)
  };
}

function classifyPullRequest(title: string, labels: string[]): ReleaseNoteType {
  const haystack = `${title} ${labels.join(" ")}`.toLowerCase();
  const prefix = title.toLowerCase().match(/^(\w+)(\([^)]*\))?!?:/)?.[1];

  if (prefix === "feat" || /\b(feature|enhancement)\b/.test(haystack)) return "feature";
  if (prefix === "fix" || /\b(fix|bug|bugfix|hotfix)\b/.test(haystack)) return "fix";
  if (prefix === "perf" || /\bperformance\b/.test(haystack)) return "performance";
  if (prefix === "refactor" || /\brefactor\b/.test(haystack)) return "refactor";
  if (prefix === "docs" || /\bdocs?\b|\bdocumentation\b/.test(haystack)) return "docs";
  return "other";
}

function readConfig(): { token: string; repo: string } {
  const token = process.env.GITHUB_TOKEN;
  const repo = process.env.GITHUB_REPO;
  if (!token || !repo) {
    throw new Error("GITHUB_TOKEN and GITHUB_REPO are required");
  }
  if (!/^[^/\s]+\/[^/\s]+$/.test(repo)) {
    throw new Error('GITHUB_REPO must be in "owner/repo" format');
  }
  return { token, repo };
}

function githubFetch(url: string | URL, token: string, fetchImpl: typeof fetch): Promise<Response> {
  return fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "User-Agent": "atom-eve-release-notes"
    }
  });
}

async function apiError(response: Response, label: string): Promise<Error> {
  const body = await response.text().catch(() => "");
  return new Error(`${label} API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
}
