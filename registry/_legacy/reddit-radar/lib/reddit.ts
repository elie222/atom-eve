export interface RedditThread {
  id: string;
  subreddit: string;
  title: string;
  permalink: string;
  url: string;
  author: string;
  score: number;
  numComments: number;
  createdUtc: number;
  selftext: string;
}

export interface RankedThread extends RedditThread {
  fitScore: number;
  reachScore: number;
  rankScore: number;
  matchedKeywords: string[];
}

export interface FindThreadsResult {
  generatedAt: string;
  mode: "read_only_draft";
  subreddits: string[];
  query: string;
  threads: RankedThread[];
  draftingHint: string;
  credentialsConfigured: boolean;
}

export const findThreadsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    subreddits: {
      type: "array",
      items: { type: "string" },
      description: "Subreddits to monitor without the r/ prefix. Defaults to an all-Reddit search."
    },
    query: {
      type: "string",
      description: "Keywords to search for and rank threads by. Defaults to an empty query that returns the newest threads."
    },
    limit: {
      type: "number",
      description: "Maximum number of ranked threads to return. Defaults to 25."
    }
  }
} as const;

export interface FindThreadsInput {
  subreddits?: string[];
  query?: string;
  limit?: number;
}

export function normalizeFindThreadsInput(input: unknown): FindThreadsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Reddit Radar input must be an object.");
  }

  const value = input as Record<string, unknown>;

  let subreddits: string[] | undefined;
  if (value.subreddits !== undefined) {
    if (!Array.isArray(value.subreddits) || value.subreddits.some((item) => typeof item !== "string")) {
      throw new Error("subreddits must be an array of strings.");
    }
    subreddits = (value.subreddits as string[])
      .map((sub) => sub.trim().replace(/^\/?r\//i, ""))
      .filter((sub) => sub.length > 0);
  }

  if (value.query !== undefined && typeof value.query !== "string") {
    throw new Error("query must be a string.");
  }

  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isFinite(value.limit) || value.limit <= 0)) {
    throw new Error("limit must be a positive number.");
  }

  return {
    subreddits,
    query: value.query as string | undefined,
    limit: value.limit as number | undefined
  };
}

export async function findThreads(input: FindThreadsInput = {}, fetchImpl: typeof fetch = fetch): Promise<FindThreadsResult> {
  const subreddits = input.subreddits ?? [];
  const query = (input.query ?? "").trim();
  const limit = input.limit ?? 25;
  const keywords = extractKeywords(query);

  const userAgent = process.env.REDDIT_USER_AGENT;
  if (!userAgent) throw new Error("REDDIT_USER_AGENT is required");

  const token = await getAccessToken(userAgent, fetchImpl);
  const targets = subreddits.length > 0 ? subreddits : [""];
  const batches = await Promise.all(
    targets.map((sub) => fetchListing(sub, query, limit, token, userAgent, fetchImpl))
  );

  const ranked = rankThreads(dedupe(batches.flat()), keywords).slice(0, limit);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    subreddits,
    query,
    threads: ranked,
    draftingHint:
      "Use the copywriting skill to draft a short, non-spammy reply for the top-ranked threads. Lead with value, disclose any affiliation honestly, and present each draft with its target thread link for operator approval; do not post anything to Reddit without explicit sign-off.",
    credentialsConfigured: Boolean(
      process.env.REDDIT_CLIENT_ID && process.env.REDDIT_CLIENT_SECRET && process.env.REDDIT_USER_AGENT
    )
  };
}

// Application-only OAuth: a script app's client_id/client_secret are exchanged for a read-only
// token via the client_credentials grant. No user password is needed for reading public threads.
async function getAccessToken(userAgent: string, fetchImpl: typeof fetch): Promise<string> {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET are required");
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const response = await fetchImpl("https://www.reddit.com/api/v1/access_token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": userAgent
    },
    body: new URLSearchParams({ grant_type: "client_credentials" }).toString()
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Reddit OAuth failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { access_token?: unknown };
  if (typeof payload.access_token !== "string" || payload.access_token.length === 0) {
    throw new Error("Reddit OAuth response did not include an access_token.");
  }
  return payload.access_token;
}

async function fetchListing(
  subreddit: string,
  query: string,
  limit: number,
  token: string,
  userAgent: string,
  fetchImpl: typeof fetch
): Promise<RedditThread[]> {
  const url = listingUrl(subreddit, query, limit);
  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": userAgent
    }
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Reddit API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  return parseListing(await response.json());
}

function listingUrl(subreddit: string, query: string, limit: number): URL {
  if (query) {
    const base = subreddit
      ? `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/search`
      : "https://oauth.reddit.com/search";
    const url = new URL(base);
    url.searchParams.set("q", query);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("sort", "new");
    url.searchParams.set("type", "link");
    if (subreddit) url.searchParams.set("restrict_sr", "true");
    return url;
  }

  // No query: fall back to the newest threads in the subreddit (or r/all).
  const base = subreddit
    ? `https://oauth.reddit.com/r/${encodeURIComponent(subreddit)}/new`
    : "https://oauth.reddit.com/r/all/new";
  const url = new URL(base);
  url.searchParams.set("limit", String(limit));
  return url;
}

function parseListing(payload: unknown): RedditThread[] {
  const listing = payload as { data?: { children?: Array<{ data?: Record<string, unknown> }> } };
  const children = listing.data?.children ?? [];
  return children.map((child) => {
    const data = child.data ?? {};
    const permalink = data.permalink == null ? "" : String(data.permalink);
    return {
      id: String(data.id ?? ""),
      subreddit: String(data.subreddit ?? ""),
      title: String(data.title ?? ""),
      permalink: permalink ? `https://www.reddit.com${permalink}` : "",
      url: String(data.url ?? ""),
      author: String(data.author ?? ""),
      score: Number(data.score ?? 0),
      numComments: Number(data.num_comments ?? 0),
      createdUtc: Number(data.created_utc ?? 0),
      selftext: String(data.selftext ?? "")
    };
  });
}

export function rankThreads(threads: RedditThread[], keywords: string[]): RankedThread[] {
  return threads
    .map((thread) => {
      const haystack = `${thread.title} ${thread.selftext}`.toLowerCase();
      const matchedKeywords = keywords.filter((keyword) => haystack.includes(keyword));
      const fitScore = keywords.length === 0 ? 0 : Math.round((matchedKeywords.length / keywords.length) * 100);
      const reachScore = Math.round(Math.log10(Math.max(thread.score, 0) + thread.numComments * 2 + 1) * 25);
      const rankScore = Math.round(fitScore * 0.6 + reachScore * 0.4);
      return { ...thread, fitScore, reachScore, rankScore, matchedKeywords };
    })
    .sort((a, b) => b.rankScore - a.rankScore);
}

function extractKeywords(query: string): string[] {
  return Array.from(
    new Set(
      query
        .toLowerCase()
        .split(/[^a-z0-9]+/)
        .filter((word) => word.length > 2)
    )
  );
}

function dedupe(threads: RedditThread[]): RedditThread[] {
  const seen = new Set<string>();
  return threads.filter((thread) => {
    const key = thread.id || thread.permalink;
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
