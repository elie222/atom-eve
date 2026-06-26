export interface IntercomConversationSummary {
  id: string;
  createdAt: string;
  state: string;
  text: string;
}

export interface TicketCluster {
  topic: string;
  conversationCount: number;
  conversationIds: string[];
  exampleSnippets: string[];
}

export interface KbArticleDraft {
  topic: string;
  proposedTitle: string;
  outline: string[];
  basedOnConversationCount: number;
  recommendation: string;
}

export interface DocGap {
  topic: string;
  conversationCount: number;
  reason: string;
}

export interface IntercomTicketReview {
  generatedAt: string;
  mode: "read_only_draft";
  dataWindow: { sinceDays: number };
  conversationsReviewed: number;
  clusters: TicketCluster[];
  articleDrafts: KbArticleDraft[];
  docGaps: DocGap[];
  draftingHint: string;
}

// A recurring topic needs at least this many conversations to be clustered.
const RECURRING_MIN = 2;
// A cluster at or above this volume is flagged as a priority documentation gap.
const HIGH_VOLUME = 4;

export const reviewRecentTicketsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    lookbackDays: {
      type: "integer",
      minimum: 1,
      maximum: 90,
      description: "How many days of recent conversations to review. Defaults to 30."
    },
    maxConversations: {
      type: "integer",
      minimum: 1,
      maximum: 150,
      description: "Maximum number of conversations to fetch. Defaults to 100."
    }
  }
} as const;

export interface ReviewRecentTicketsInput {
  lookbackDays?: number;
  maxConversations?: number;
}

export function normalizeReviewRecentTicketsInput(input: unknown): ReviewRecentTicketsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Knowledge base review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    lookbackDays: optionalInteger(value.lookbackDays, "lookbackDays", 1, 90),
    maxConversations: optionalInteger(value.maxConversations, "maxConversations", 1, 150)
  };
}

export async function reviewRecentTickets(
  input: ReviewRecentTicketsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<IntercomTicketReview> {
  const parsed = normalizeReviewRecentTicketsInput(input);
  const lookbackDays = parsed.lookbackDays ?? 30;
  const maxConversations = parsed.maxConversations ?? 100;

  const conversations = await fetchRecentConversations(lookbackDays, maxConversations, fetchImpl);
  const clusters = clusterConversations(conversations);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    dataWindow: { sinceDays: lookbackDays },
    conversationsReviewed: conversations.length,
    clusters,
    articleDrafts: draftArticles(clusters),
    docGaps: flagDocGaps(clusters),
    draftingHint:
      "Draft each proposed knowledge base article from the clustered conversations and present it for operator approval with its title and outline. Do not publish, edit live articles, or reply to customers unless a separate write tool confirms the action."
  };
}

export async function fetchRecentConversations(
  lookbackDays = 30,
  maxConversations = 100,
  fetchImpl: typeof fetch = fetch
): Promise<IntercomConversationSummary[]> {
  const token = process.env.INTERCOM_ACCESS_TOKEN;
  if (!token) throw new Error("INTERCOM_ACCESS_TOKEN is required");

  const sinceUnix = Math.floor((Date.now() - lookbackDays * 24 * 60 * 60 * 1000) / 1000);
  const perPage = Math.min(Math.max(maxConversations, 1), 150);

  const response = await fetchImpl("https://api.intercom.io/conversations/search", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Content-Type": "application/json",
      "Intercom-Version": "2.11"
    },
    body: JSON.stringify({
      query: {
        field: "created_at",
        operator: ">",
        value: sinceUnix
      },
      pagination: { per_page: perPage }
    })
  });

  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Intercom API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { conversations?: Array<Record<string, unknown>> };
  const rows = Array.isArray(payload.conversations) ? payload.conversations : [];
  return rows.slice(0, maxConversations).map((row) => {
    const source = (row.source ?? {}) as Record<string, unknown>;
    const subject = typeof source.subject === "string" ? source.subject : "";
    const body = typeof source.body === "string" ? source.body : "";
    const title = typeof row.title === "string" ? row.title : "";
    return {
      id: String(row.id ?? ""),
      createdAt: toIso(row.created_at),
      state: String(row.state ?? "unknown"),
      text: stripHtml([title, subject, body].filter(Boolean).join(". "))
    };
  });
}

export function clusterConversations(conversations: IntercomConversationSummary[]): TicketCluster[] {
  const tokensById = new Map<string, string[]>();
  const documentFrequency = new Map<string, number>();

  for (const conversation of conversations) {
    const tokens = uniqueTokens(conversation.text);
    tokensById.set(conversation.id, tokens);
    for (const token of tokens) {
      documentFrequency.set(token, (documentFrequency.get(token) ?? 0) + 1);
    }
  }

  // Order recurring keywords by how many conversations mention them, then alphabetically
  // so the same input always produces the same clusters.
  const recurringKeywords = [...documentFrequency.entries()]
    .filter(([, count]) => count >= RECURRING_MIN)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([keyword]) => keyword);

  const keywordRank = new Map(recurringKeywords.map((keyword, index) => [keyword, index]));
  const grouped = new Map<string, IntercomConversationSummary[]>();

  for (const conversation of conversations) {
    const tokens = tokensById.get(conversation.id) ?? [];
    const topic = tokens
      .filter((token) => keywordRank.has(token))
      .sort((a, b) => (keywordRank.get(a) ?? 0) - (keywordRank.get(b) ?? 0))[0];
    if (!topic) continue;
    const bucket = grouped.get(topic) ?? [];
    bucket.push(conversation);
    grouped.set(topic, bucket);
  }

  return [...grouped.entries()]
    .map(([topic, items]) => ({
      topic,
      conversationCount: items.length,
      conversationIds: items.map((item) => item.id),
      exampleSnippets: items.slice(0, 2).map((item) => snippet(item.text))
    }))
    .filter((cluster) => cluster.conversationCount >= RECURRING_MIN)
    .sort((a, b) => b.conversationCount - a.conversationCount || a.topic.localeCompare(b.topic));
}

export function draftArticles(clusters: TicketCluster[]): KbArticleDraft[] {
  return clusters.map((cluster) => ({
    topic: cluster.topic,
    proposedTitle: `How to ${cluster.topic}`,
    outline: [
      `Summary of what customers ask about "${cluster.topic}"`,
      "Step-by-step answer grounded in the clustered conversations",
      "Common pitfalls and edge cases",
      "Links to related articles and where to get more help"
    ],
    basedOnConversationCount: cluster.conversationCount,
    recommendation:
      "Draft this as a new knowledge base article, or update an existing article if one already covers the topic. Present it for operator approval before publishing."
  }));
}

export function flagDocGaps(clusters: TicketCluster[]): DocGap[] {
  return clusters
    .filter((cluster) => cluster.conversationCount >= HIGH_VOLUME)
    .map((cluster) => ({
      topic: cluster.topic,
      conversationCount: cluster.conversationCount,
      reason:
        "High volume of recurring questions suggests existing documentation is missing or unclear. Prioritize this topic for a new or revised article."
    }));
}

const STOPWORDS = new Set([
  "the", "and", "for", "you", "your", "with", "that", "this", "have", "has", "from", "are",
  "was", "were", "but", "not", "can", "cant", "cannot", "would", "could", "should", "about",
  "what", "when", "where", "which", "while", "there", "their", "they", "them", "then", "than",
  "into", "out", "our", "ours", "how", "why", "who", "will", "just", "like", "want", "need",
  "get", "got", "any", "all", "some", "been", "being", "does", "did", "doing", "here", "hello",
  "hi", "team", "please", "thanks", "thank", "help", "issue", "question", "support", "able"
]);

function uniqueTokens(text: string): string[] {
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOPWORDS.has(word) && !/^\d+$/.test(word));
  return [...new Set(tokens)];
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, " ")
    .replace(/&[a-z]+;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function snippet(text: string): string {
  return text.length > 160 ? `${text.slice(0, 157)}...` : text;
}

function toIso(value: unknown): string {
  const seconds = Number(value);
  if (!Number.isFinite(seconds) || seconds <= 0) return new Date().toISOString();
  return new Date(seconds * 1000).toISOString();
}

function optionalInteger(value: unknown, field: string, min: number, max: number): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "number" || !Number.isInteger(value) || value < min || value > max) {
    throw new Error(`${field} must be an integer between ${min} and ${max}.`);
  }
  return value;
}
