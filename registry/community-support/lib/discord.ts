export interface DiscordMessage {
  id: string;
  author: string;
  authorId: string;
  content: string;
  timestamp: string;
  isQuestion: boolean;
}

export interface MessageTriage {
  messageId: string;
  author: string;
  severity: "answerable" | "needs_context" | "escalate";
  note: string;
}

export interface DiscordChannelReview {
  generatedAt: string;
  mode: "read_only_draft";
  channelId: string;
  messages: DiscordMessage[];
  triage: MessageTriage[];
  draftingHint: string;
}

const ESCALATE_TERMS = [
  "refund",
  "chargeback",
  "lawyer",
  "legal",
  "gdpr",
  "security",
  "breach",
  "hacked",
  "urgent",
  "angry",
  "complaint"
];

export const reviewMessagesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "How many recent messages to read from the channel (1-100). Defaults to 25."
    }
  }
} as const;

export interface ReviewMessagesInput {
  limit?: number;
}

export function normalizeReviewMessagesInput(input: unknown): ReviewMessagesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Community support review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.limit === undefined) return {};
  if (typeof value.limit !== "number" || !Number.isInteger(value.limit) || value.limit < 1 || value.limit > 100) {
    throw new Error("limit must be an integer between 1 and 100.");
  }
  return { limit: value.limit };
}

export async function reviewMessages(
  input: ReviewMessagesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<DiscordChannelReview> {
  const parsed = normalizeReviewMessagesInput(input);
  const limit = parsed.limit ?? 25;
  const channelId = process.env.DISCORD_CHANNEL_ID ?? "";
  const messages = await fetchChannelMessages(limit, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    channelId,
    messages,
    triage: triageMessages(messages),
    draftingHint:
      "Draft doc-grounded answers for the answerable questions and present each as a reply tied to its message for operator approval. Escalate flagged messages to a human maintainer. Do not post anything to Discord."
  };
}

export async function fetchChannelMessages(
  limit = 25,
  fetchImpl: typeof fetch = fetch
): Promise<DiscordMessage[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!token || !channelId) {
    throw new Error("DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID are required");
  }

  const url = new URL(`https://discord.com/api/v10/channels/${channelId}/messages`);
  url.searchParams.set("limit", String(limit));

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bot ${token}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Discord API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  return rows.map((row) => {
    const author = row.author && typeof row.author === "object" ? (row.author as Record<string, unknown>) : {};
    const content = String(row.content ?? "");
    return {
      id: String(row.id ?? ""),
      author: String(author.username ?? "unknown"),
      authorId: String(author.id ?? ""),
      content,
      timestamp: String(row.timestamp ?? ""),
      isQuestion: content.includes("?")
    };
  });
}

export function triageMessages(messages: DiscordMessage[]): MessageTriage[] {
  return messages.map((message) => {
    const text = message.content.toLowerCase();
    if (ESCALATE_TERMS.some((term) => text.includes(term))) {
      return {
        messageId: message.id,
        author: message.author,
        severity: "escalate",
        note: "Sensitive or high-risk topic. Escalate to a human maintainer; do not auto-answer."
      };
    }

    if (message.isQuestion) {
      return {
        messageId: message.id,
        author: message.author,
        severity: "answerable",
        note: "Looks like a support question. Draft a doc-grounded answer for operator approval before anyone posts it."
      };
    }

    return {
      messageId: message.id,
      author: message.author,
      severity: "needs_context",
      note: "Not an obvious question. Confirm intent before drafting a reply."
    };
  });
}
