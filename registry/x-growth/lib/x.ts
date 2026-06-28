export interface XMention {
  id: string;
  text: string;
  authorId: string | null;
  createdAt: string | null;
}

export interface XMentionsReview {
  generatedAt: string;
  mode: "read_only_draft";
  query: string;
  mentions: XMention[];
  draftingHint: string;
}

export const searchXMentionsInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["query"],
  properties: {
    query: {
      type: "string",
      description: "X recent-search query for the brand or keywords to monitor (e.g. '\"acme\" OR @acme -is:retweet')."
    }
  }
} as const;

export interface SearchXMentionsInput {
  query: string;
}

export function normalizeSearchXMentionsInput(input: unknown): SearchXMentionsInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("X mentions search input must be an object with a query.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.query !== "string" || value.query.trim() === "") {
    throw new Error("query is required and must be a non-empty string.");
  }

  return { query: value.query };
}

export async function searchXMentions(
  input: SearchXMentionsInput,
  fetchImpl: typeof fetch = fetch
): Promise<XMentionsReview> {
  const parsed = normalizeSearchXMentionsInput(input);
  const mentions = await fetchRecentMentions(parsed.query, fetchImpl);
  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    query: parsed.query,
    mentions,
    draftingHint:
      "Use the content-strategy skill to draft engagement replies for the most relevant mentions plus a few original post ideas. Present every reply and post as a draft for operator approval; do not post, reply, like, or follow without explicit sign-off."
  };
}

async function fetchRecentMentions(query: string, fetchImpl: typeof fetch): Promise<XMention[]> {
  const token = process.env.X_BEARER_TOKEN;
  if (!token) throw new Error("X_BEARER_TOKEN is required");

  const url = new URL("https://api.twitter.com/2/tweets/search/recent");
  url.searchParams.set("query", query);
  url.searchParams.set("tweet.fields", "created_at,author_id");

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`X API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return (payload.data ?? []).map((row) => ({
    id: String(row.id ?? ""),
    text: String(row.text ?? ""),
    authorId: row.author_id == null ? null : String(row.author_id),
    createdAt: row.created_at == null ? null : String(row.created_at)
  }));
}
