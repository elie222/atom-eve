export interface SlackUpdate {
  ts: string;
  user: string;
  text: string;
  replyCount: number;
  reactionCount: number;
  isThreadParent: boolean;
}

export interface StandupDigestReview {
  generatedAt: string;
  mode: "read_only_draft";
  channelId: string;
  window: {
    sinceHours: number;
    oldest: string;
  };
  updates: SlackUpdate[];
  draftingHint: string;
}

export const reviewUpdatesInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    limit: {
      type: "integer",
      minimum: 1,
      maximum: 200,
      description: "Maximum number of recent messages to read. Defaults to 50."
    },
    sinceHours: {
      type: "number",
      minimum: 1,
      maximum: 168,
      description: "How many hours of history to include. Defaults to 24."
    }
  }
} as const;

export interface ReviewUpdatesInput {
  limit?: number;
  sinceHours?: number;
}

export function normalizeReviewUpdatesInput(input: unknown): ReviewUpdatesInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Standup updates input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.limit !== undefined && (typeof value.limit !== "number" || !Number.isInteger(value.limit))) {
    throw new Error("limit must be an integer.");
  }
  if (value.sinceHours !== undefined && typeof value.sinceHours !== "number") {
    throw new Error("sinceHours must be a number.");
  }

  return {
    limit: value.limit as number | undefined,
    sinceHours: value.sinceHours as number | undefined
  };
}

export async function reviewUpdates(
  input: ReviewUpdatesInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<StandupDigestReview> {
  const parsed = normalizeReviewUpdatesInput(input);
  const limit = parsed.limit ?? 50;
  const sinceHours = parsed.sinceHours ?? 24;
  const oldest = String(Math.floor(Date.now() / 1000 - sinceHours * 3600));
  const channelId = process.env.SLACK_CHANNEL_ID;

  const updates = await fetchChannelHistory({ limit, oldest }, fetchImpl);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    channelId: channelId ?? "",
    window: { sinceHours, oldest },
    updates,
    draftingHint:
      "Group these updates into a daily standup digest with sections for priorities, active threads, and wins. Present the digest as a draft for operator approval; do not post it back to Slack or send anything without explicit sign-off."
  };
}

export async function fetchChannelHistory(
  options: { limit: number; oldest: string },
  fetchImpl: typeof fetch = fetch
): Promise<SlackUpdate[]> {
  const token = process.env.SLACK_BOT_TOKEN;
  const channelId = process.env.SLACK_CHANNEL_ID;
  if (!token || !channelId) {
    throw new Error("SLACK_BOT_TOKEN and SLACK_CHANNEL_ID are required");
  }

  const url = new URL("https://slack.com/api/conversations.history");
  url.searchParams.set("channel", channelId);
  url.searchParams.set("limit", String(options.limit));
  url.searchParams.set("oldest", options.oldest);

  const response = await fetchImpl(url, {
    headers: { Authorization: `Bearer ${token}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Slack API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as {
    ok?: boolean;
    error?: string;
    messages?: Array<Record<string, unknown>>;
  };
  if (!payload.ok) {
    throw new Error(`Slack API error: ${payload.error ?? "unknown_error"}`);
  }

  return (payload.messages ?? []).map((row) => {
    const reactions = Array.isArray(row.reactions) ? (row.reactions as Array<Record<string, unknown>>) : [];
    const reactionCount = reactions.reduce((sum, reaction) => sum + Number(reaction.count ?? 0), 0);
    const replyCount = Number(row.reply_count ?? 0);
    return {
      ts: String(row.ts ?? ""),
      user: String(row.user ?? row.bot_id ?? "unknown"),
      text: String(row.text ?? ""),
      replyCount,
      reactionCount,
      isThreadParent: replyCount > 0
    };
  });
}
