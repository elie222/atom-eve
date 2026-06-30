export type ConversationState = "open" | "closed" | "snoozed";

export interface ReadConversationsInput {
  state?: ConversationState | "all";
  perPage?: number;
  includeParts?: boolean;
}

export interface IntercomAuthor {
  id: string | null;
  type: string | null;
  name: string | null;
  email: string | null;
}

export interface IntercomAttachment {
  name: string | null;
  url: string | null;
  contentType: string | null;
}

export interface IntercomConversationPart {
  id: string;
  partType: string | null;
  createdAt: number | null;
  updatedAt: number | null;
  author: IntercomAuthor;
  body: string;
  redacted: boolean | null;
  attachments: IntercomAttachment[];
}

export interface IntercomConversation {
  id: string;
  state: ConversationState;
  open: boolean | null;
  read: boolean | null;
  priority: string | null;
  createdAt: number | null;
  updatedAt: number | null;
  waitingSince: number | null;
  snoozedUntil: number | null;
  title: string | null;
  source: {
    id: string | null;
    subject: string | null;
    body: string;
    url: string | null;
    author: IntercomAuthor;
  };
  assignee: IntercomAuthor;
  tags: string[];
  sla: {
    name: string | null;
    status: string | null;
  };
  statistics: {
    countConversationParts: number | null;
    lastContactReplyAt: number | null;
    lastAdminReplyAt: number | null;
  };
  parts: IntercomConversationPart[];
}

export interface IntercomConversationsResult {
  generatedAt: string;
  filter: {
    state: ConversationState | "all";
    perPage: number;
    includeParts: boolean;
  };
  conversations: IntercomConversation[];
}

export const readConversationsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    state: {
      type: "string",
      enum: ["open", "closed", "snoozed", "all"],
      description: "Conversation state to read. Defaults to open.",
    },
    perPage: {
      type: "integer",
      minimum: 1,
      maximum: 50,
      description: "Maximum number of conversations to read. Defaults to 20.",
    },
    includeParts: {
      type: "boolean",
      description: "Whether to retrieve each conversation by id to include conversation parts. Defaults to true.",
    },
  },
} as const;

export function normalizeReadConversationsInput(input: unknown): ReadConversationsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Intercom conversations input must be an object.");
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
  if (value.includeParts !== undefined && typeof value.includeParts !== "boolean") {
    throw new Error("includeParts must be a boolean.");
  }

  return {
    state: value.state as ConversationState | "all" | undefined,
    perPage: value.perPage as number | undefined,
    includeParts: value.includeParts as boolean | undefined,
  };
}

export async function readConversations(
  input: ReadConversationsInput = {},
  fetchImpl: typeof fetch = fetch,
): Promise<IntercomConversationsResult> {
  const parsed = normalizeReadConversationsInput(input);
  const state = parsed.state ?? "open";
  const perPage = parsed.perPage ?? 20;
  const includeParts = parsed.includeParts ?? true;

  const listed = await fetchConversations(perPage, fetchImpl);
  const filtered = state === "all" ? listed : listed.filter((conversation) => conversation.state === state);
  const conversations = includeParts
    ? await Promise.all(filtered.map((conversation) => fetchConversation(conversation.id, fetchImpl)))
    : filtered;

  return {
    generatedAt: new Date().toISOString(),
    filter: { state, perPage, includeParts },
    conversations,
  };
}

export async function fetchConversations(
  perPage = 20,
  fetchImpl: typeof fetch = fetch,
): Promise<IntercomConversation[]> {
  const url = new URL("https://api.intercom.io/conversations");
  url.searchParams.set("per_page", String(perPage));
  url.searchParams.set("sort", "updated_at");
  url.searchParams.set("order", "desc");

  const payload = await intercom<{ conversations?: Array<Record<string, unknown>> }>(url, fetchImpl);
  return (payload.conversations ?? []).map(normalizeConversation);
}

export async function fetchConversation(
  conversationId: string,
  fetchImpl: typeof fetch = fetch,
): Promise<IntercomConversation> {
  const url = new URL(`https://api.intercom.io/conversations/${encodeURIComponent(conversationId)}`);
  url.searchParams.set("display_as", "plaintext");
  const payload = await intercom<Record<string, unknown>>(url, fetchImpl);
  return normalizeConversation(payload);
}

async function intercom<T>(url: URL, fetchImpl: typeof fetch): Promise<T> {
  const token = process.env.INTERCOM_ACCESS_TOKEN;
  if (!token) throw new Error("INTERCOM_ACCESS_TOKEN is required.");

  const response = await fetchImpl(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      "Intercom-Version": "2.11",
    },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Intercom API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  return (await response.json()) as T;
}

function normalizeConversation(row: Record<string, unknown>): IntercomConversation {
  const source = objectValue(row.source);
  const assignee = objectValue(row.assignee);
  const sla = objectValue(row.sla_applied);
  const statistics = objectValue(row.statistics);
  const state = stringValue(row.state);

  return {
    id: stringValue(row.id),
    state: state === "closed" || state === "snoozed" ? state : "open",
    open: booleanValue(row.open),
    read: booleanValue(row.read),
    priority: nullableString(row.priority),
    createdAt: numberValue(row.created_at),
    updatedAt: numberValue(row.updated_at),
    waitingSince: numberValue(row.waiting_since),
    snoozedUntil: numberValue(row.snoozed_until),
    title: nullableString(row.title),
    source: {
      id: nullableString(source.id),
      subject: nullableString(source.subject),
      body: stripHtml(source.body),
      url: nullableString(source.url),
      author: normalizeAuthor(source.author),
    },
    assignee: normalizeAuthor(assignee),
    tags: normalizeTags(row.tags),
    sla: {
      name: nullableString(sla.sla_name),
      status: nullableString(sla.sla_status),
    },
    statistics: {
      countConversationParts: numberValue(statistics.count_conversation_parts),
      lastContactReplyAt: numberValue(statistics.last_contact_reply_at),
      lastAdminReplyAt: numberValue(statistics.last_admin_reply_at),
    },
    parts: normalizeParts(row.conversation_parts),
  };
}

function normalizeParts(value: unknown): IntercomConversationPart[] {
  const wrapper = objectValue(value);
  const parts = Array.isArray(wrapper.conversation_parts) ? (wrapper.conversation_parts as unknown[]) : [];

  return parts.map((part) => {
    const row = objectValue(part);
    return {
      id: stringValue(row.id),
      partType: nullableString(row.part_type),
      createdAt: numberValue(row.created_at),
      updatedAt: numberValue(row.updated_at),
      author: normalizeAuthor(row.author),
      body: stripHtml(row.body),
      redacted: booleanValue(row.redacted),
      attachments: normalizeAttachments(row.attachments),
    };
  });
}

function normalizeAuthor(value: unknown): IntercomAuthor {
  const row = objectValue(value);
  return {
    id: nullableString(row.id),
    type: nullableString(row.type),
    name: nullableString(row.name),
    email: nullableString(row.email),
  };
}

function normalizeAttachments(value: unknown): IntercomAttachment[] {
  if (!Array.isArray(value)) return [];
  return value.map((attachment) => {
    const row = objectValue(attachment);
    return {
      name: nullableString(row.name),
      url: nullableString(row.url),
      contentType: nullableString(row.content_type),
    };
  });
}

function normalizeTags(value: unknown): string[] {
  const wrapper = objectValue(value);
  const tags = Array.isArray(wrapper.tags) ? wrapper.tags : [];
  return tags.map((tag) => nullableString(objectValue(tag).name)).filter((tag): tag is string => Boolean(tag));
}

function stripHtml(body: unknown): string {
  if (typeof body !== "string") return "";
  return body.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

function objectValue(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

function stringValue(value: unknown): string {
  return value == null ? "" : String(value);
}

function nullableString(value: unknown): string | null {
  return value == null ? null : String(value);
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function booleanValue(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}
