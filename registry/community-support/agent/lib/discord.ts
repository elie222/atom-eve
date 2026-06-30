export interface ReadMessagesInput {
  limit?: number;
  beforeMessageId?: string;
}

export interface DiscordAuthor {
  id: string;
  username: string;
  displayName: string | null;
  bot: boolean;
}

export interface DiscordMention {
  id: string;
  username: string;
  displayName: string | null;
}

export interface DiscordAttachment {
  id: string;
  filename: string;
  url: string;
  contentType: string | null;
  size: number | null;
}

export interface DiscordMessage {
  id: string;
  channelId: string;
  author: DiscordAuthor;
  content: string;
  timestamp: string;
  editedTimestamp: string | null;
  type: number | null;
  replyToMessageId: string | null;
  mentions: DiscordMention[];
  attachments: DiscordAttachment[];
  embedCount: number;
}

export interface DiscordMessagesResult {
  generatedAt: string;
  channelId: string;
  limit: number;
  beforeMessageId: string | null;
  messages: DiscordMessage[];
}

export const readMessagesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 100,
      description: "Maximum number of recent channel messages to read. Defaults to 25.",
    },
    beforeMessageId: {
      type: "string",
      description: "Read messages before this Discord message id.",
    },
  },
} as const;

export function normalizeReadMessagesInput(input: unknown): ReadMessagesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Discord messages input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isInteger(value.limit))) {
    throw new Error("limit must be an integer.");
  }
  if (value.beforeMessageId !== undefined && typeof value.beforeMessageId !== "string") {
    throw new Error("beforeMessageId must be a string.");
  }

  return {
    limit: value.limit as number | undefined,
    beforeMessageId: value.beforeMessageId as string | undefined,
  };
}

export async function readMessages(
  input: ReadMessagesInput = {},
  fetchImpl: typeof fetch = fetch,
): Promise<DiscordMessagesResult> {
  const parsed = normalizeReadMessagesInput(input);
  const limit = parsed.limit ?? 25;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  const messages = await fetchChannelMessages({ limit, beforeMessageId: parsed.beforeMessageId }, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    channelId: channelId ?? "",
    limit,
    beforeMessageId: parsed.beforeMessageId ?? null,
    messages,
  };
}

export async function fetchChannelMessages(
  options: { limit: number; beforeMessageId?: string },
  fetchImpl: typeof fetch = fetch,
): Promise<DiscordMessage[]> {
  const token = process.env.DISCORD_BOT_TOKEN;
  const channelId = process.env.DISCORD_CHANNEL_ID;
  if (!token || !channelId) {
    throw new Error("DISCORD_BOT_TOKEN and DISCORD_CHANNEL_ID are required.");
  }

  const url = new URL(`https://discord.com/api/v10/channels/${encodeURIComponent(channelId)}/messages`);
  url.searchParams.set("limit", String(options.limit));
  if (options.beforeMessageId) url.searchParams.set("before", options.beforeMessageId);

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bot ${token}` },
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Discord API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  return rows.map(normalizeMessage);
}

function normalizeMessage(row: Record<string, unknown>): DiscordMessage {
  const author = objectValue(row.author);
  const referencedMessage = objectValue(row.referenced_message);
  const mentions = Array.isArray(row.mentions) ? (row.mentions as Array<Record<string, unknown>>) : [];
  const attachments = Array.isArray(row.attachments) ? (row.attachments as Array<Record<string, unknown>>) : [];
  const embeds = Array.isArray(row.embeds) ? row.embeds : [];

  return {
    id: stringValue(row.id),
    channelId: stringValue(row.channel_id),
    author: {
      id: stringValue(author.id),
      username: stringValue(author.username),
      displayName: nullableString(author.global_name ?? author.display_name),
      bot: author.bot === true,
    },
    content: stringValue(row.content),
    timestamp: stringValue(row.timestamp),
    editedTimestamp: nullableString(row.edited_timestamp),
    type: typeof row.type === "number" ? row.type : null,
    replyToMessageId: nullableString(referencedMessage.id),
    mentions: mentions.map((mention) => ({
      id: stringValue(mention.id),
      username: stringValue(mention.username),
      displayName: nullableString(mention.global_name ?? mention.display_name),
    })),
    attachments: attachments.map((attachment) => ({
      id: stringValue(attachment.id),
      filename: stringValue(attachment.filename),
      url: stringValue(attachment.url),
      contentType: nullableString(attachment.content_type),
      size: typeof attachment.size === "number" ? attachment.size : null,
    })),
    embedCount: embeds.length,
  };
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
