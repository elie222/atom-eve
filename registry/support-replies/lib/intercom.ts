export type ConversationState = "open" | "closed" | "snoozed";

export interface IntercomConversation {
  id: string;
  state: ConversationState;
  priority: "priority" | "not_priority";
  title: string | null;
  preview: string;
  waitingSince: number | null;
  customer: { name: string | null; email: string | null };
}

export interface ReplyPlan {
  conversationId: string;
  action: "draft_reply" | "escalate";
  reason: string;
  draftingHint: string;
}

export const reviewConversationsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    state: {
      type: "string",
      enum: ["open", "closed", "snoozed", "all"],
      description: "Conversation state to review. Defaults to open."
    },
    perPage: {
      type: "integer",
      minimum: 1,
      maximum: 150,
      description: "Maximum number of conversations to fetch. Defaults to 20."
    }
  }
} as const;

export interface ReviewConversationsInput {
  state?: ConversationState | "all";
  perPage?: number;
}

export function normalizeReviewConversationsInput(input: unknown): ReviewConversationsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Support replies review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.state !== undefined) {
    if (typeof value.state !== "string" || !["open", "closed", "snoozed", "all"].includes(value.state)) {
      throw new Error("state must be one of: open, closed, snoozed, all.");
    }
  }
  if (value.perPage !== undefined && (typeof value.perPage !== "number" || !Number.isInteger(value.perPage))) {
    throw new Error("perPage must be an integer.");
  }

  return {
    state: value.state as ConversationState | "all" | undefined,
    perPage: value.perPage as number | undefined
  };
}

export interface ConversationReview {
  generatedAt: string;
  mode: "read_only_draft";
  filter: { state: ConversationState | "all"; perPage: number };
  conversations: IntercomConversation[];
  replyPlans: ReplyPlan[];
  draftingHint: string;
}

export async function reviewConversations(
  input: ReviewConversationsInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<ConversationReview> {
  const parsed = normalizeReviewConversationsInput(input);
  const state = parsed.state ?? "open";
  const perPage = parsed.perPage ?? 20;

  const all = await fetchConversations(perPage, fetchImpl);
  const conversations = state === "all" ? all : all.filter((conversation) => conversation.state === state);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    filter: { state, perPage },
    conversations,
    replyPlans: buildReplyPlans(conversations),
    draftingHint:
      "For each draft_reply plan, write a grounded reply using only facts from the conversation thread and documented product knowledge; present it for operator approval with the conversation id and customer. Do not reply, close, snooze, or change any conversation in Intercom."
  };
}

export async function fetchConversations(
  perPage = 20,
  fetchImpl: typeof fetch = fetch
): Promise<IntercomConversation[]> {
  const token = process.env.INTERCOM_ACCESS_TOKEN;
  if (!token) throw new Error("INTERCOM_ACCESS_TOKEN is required");

  const url = new URL("https://api.intercom.io/conversations");
  url.searchParams.set("per_page", String(perPage));

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Intercom-Version": "2.11"
    }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Intercom API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { conversations?: Array<Record<string, unknown>> };
  return (payload.conversations ?? []).map(normalizeConversation);
}

export function buildReplyPlans(conversations: IntercomConversation[]): ReplyPlan[] {
  return conversations.map((conversation) => {
    if (conversation.priority === "priority") {
      return {
        conversationId: conversation.id,
        action: "escalate",
        reason: "Flagged as priority in Intercom; route to a human teammate rather than auto-drafting.",
        draftingHint:
          "Summarize the open question and any blockers for the assigned teammate. Do not send a reply on the customer's behalf."
      };
    }

    return {
      conversationId: conversation.id,
      action: "draft_reply",
      reason: "Open conversation suitable for a grounded draft reply.",
      draftingHint:
        "Draft a concise, friendly reply grounded only in the thread and documented product facts. Flag any claim you cannot ground for human review instead of guessing."
    };
  });
}

function normalizeConversation(row: Record<string, unknown>): IntercomConversation {
  const source = (row.source ?? {}) as Record<string, unknown>;
  const author = (source.author ?? {}) as Record<string, unknown>;
  const state = String(row.state ?? "open");

  return {
    id: String(row.id ?? ""),
    state: state === "closed" || state === "snoozed" ? state : "open",
    priority: row.priority === "priority" ? "priority" : "not_priority",
    title: row.title == null ? null : String(row.title),
    preview: stripHtml(source.body),
    waitingSince: typeof row.waiting_since === "number" ? row.waiting_since : null,
    customer: {
      name: author.name == null ? null : String(author.name),
      email: author.email == null ? null : String(author.email)
    }
  };
}

function stripHtml(body: unknown): string {
  if (typeof body !== "string") return "";
  const text = body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
  return text.length > 280 ? `${text.slice(0, 277)}...` : text;
}
