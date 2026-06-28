export type TriageCategory = "noise" | "needs_reply" | "review";

export interface InboxMessage {
  id: string;
  threadId: string;
  from: string;
  subject: string;
  date: string;
  snippet: string;
  isUnread: boolean;
}

export interface TriageRecommendation {
  id: string;
  from: string;
  subject: string;
  category: TriageCategory;
  suggestedAction: string;
}

export interface InboxReview {
  generatedAt: string;
  mode: "read_only_draft";
  query: string;
  messageCount: number;
  messages: InboxMessage[];
  recommendations: TriageRecommendation[];
  draftingHint: string;
}

interface RawInboxMessage extends InboxMessage {
  hasUnsubscribe: boolean;
}

export const reviewInboxInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    query: {
      type: "string",
      description: "Gmail search query to scope the review. Defaults to in:inbox."
    },
    maxResults: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum number of messages to review. Defaults to 25."
    }
  }
} as const;

export interface ReviewInboxInput {
  query?: string;
  maxResults?: number;
}

export function normalizeReviewInboxInput(input: unknown): ReviewInboxInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Inbox review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.query !== undefined && typeof value.query !== "string") {
    throw new Error("query must be a string.");
  }
  if (value.maxResults !== undefined) {
    if (typeof value.maxResults !== "number" || !Number.isInteger(value.maxResults)) {
      throw new Error("maxResults must be an integer.");
    }
    if (value.maxResults < 1 || value.maxResults > 100) {
      throw new Error("maxResults must be between 1 and 100.");
    }
  }

  return {
    query: value.query as string | undefined,
    maxResults: value.maxResults as number | undefined
  };
}

export async function reviewInbox(
  input: ReviewInboxInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<InboxReview> {
  const parsed = normalizeReviewInboxInput(input);
  const query = parsed.query ?? "in:inbox";
  const maxResults = parsed.maxResults ?? 25;

  const raw = await fetchInboxMessages(query, maxResults, fetchImpl);
  const messages = raw.map(({ hasUnsubscribe, ...message }) => message);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    query,
    messageCount: messages.length,
    messages,
    recommendations: recommendTriage(raw),
    draftingHint:
      "Label or archive the messages categorized as noise, and draft a reply for everything categorized as needs_reply. Present every label, archive, and reply as a draft for operator approval; this tool only reads the inbox and never changes, labels, archives, or sends anything."
  };
}

async function fetchInboxMessages(
  query: string,
  maxResults: number,
  fetchImpl: typeof fetch
): Promise<RawInboxMessage[]> {
  const token = process.env.GMAIL_ACCESS_TOKEN;
  if (!token) throw new Error("GMAIL_ACCESS_TOKEN is required");

  const listUrl = new URL("https://gmail.googleapis.com/gmail/v1/users/me/messages");
  listUrl.searchParams.set("q", query);
  listUrl.searchParams.set("maxResults", String(maxResults));

  const listResponse = await fetchImpl(listUrl, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!listResponse.ok) {
    const body = await listResponse.text().catch(() => "");
    throw new Error(
      `Gmail API failed: ${listResponse.status} ${listResponse.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const payload = (await listResponse.json()) as { messages?: Array<{ id?: unknown; threadId?: unknown }> };
  const refs = payload.messages ?? [];

  return Promise.all(
    refs.map((ref) => fetchMessageMetadata(String(ref.id ?? ""), token, fetchImpl))
  );
}

async function fetchMessageMetadata(
  id: string,
  token: string,
  fetchImpl: typeof fetch
): Promise<RawInboxMessage> {
  const url = new URL(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${id}`);
  url.searchParams.set("format", "metadata");
  for (const header of ["From", "Subject", "Date", "List-Unsubscribe"]) {
    url.searchParams.append("metadataHeaders", header);
  }

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `Gmail API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`
    );
  }

  const message = (await response.json()) as {
    id?: unknown;
    threadId?: unknown;
    snippet?: unknown;
    labelIds?: unknown;
    payload?: { headers?: Array<{ name?: unknown; value?: unknown }> };
  };

  const headers = new Map<string, string>(
    (message.payload?.headers ?? []).map((header) => [
      String(header.name ?? "").toLowerCase(),
      String(header.value ?? "")
    ])
  );
  const labelIds = Array.isArray(message.labelIds) ? message.labelIds.map(String) : [];

  return {
    id: String(message.id ?? id),
    threadId: String(message.threadId ?? ""),
    from: headers.get("from") ?? "Unknown sender",
    subject: headers.get("subject") ?? "(no subject)",
    date: headers.get("date") ?? "",
    snippet: String(message.snippet ?? ""),
    isUnread: labelIds.includes("UNREAD"),
    hasUnsubscribe: headers.has("list-unsubscribe")
  };
}

export function recommendTriage(messages: RawInboxMessage[]): TriageRecommendation[] {
  return messages.map((message) => {
    const category = categorize(message);
    return {
      id: message.id,
      from: message.from,
      subject: message.subject,
      category,
      suggestedAction: suggestedAction(category)
    };
  });
}

function categorize(message: RawInboxMessage): TriageCategory {
  const from = message.from.toLowerCase();
  const automated = /no[-_.]?reply|noreply|notifications?@|mailer|donotreply/.test(from);
  if (message.hasUnsubscribe || automated) return "noise";
  if (message.isUnread) return "needs_reply";
  return "review";
}

function suggestedAction(category: TriageCategory): string {
  if (category === "noise") {
    return "Looks like a newsletter or automated notification. Suggest labeling and archiving it. No changes were made.";
  }
  if (category === "needs_reply") {
    return "Appears to be a real message awaiting a response. Suggest drafting a reply for operator approval. No reply was sent.";
  }
  return "Unclear intent. Suggest a quick human review before labeling, archiving, or replying.";
}
