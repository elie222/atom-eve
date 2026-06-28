export interface AyrsharePost {
  id: string;
  status: string;
  platforms: string[];
  scheduledFor: string | null;
  post: string;
}

export interface AyrshareQueueReview {
  generatedAt: string;
  mode: "read_only_draft";
  view: AyrshareQueueView;
  posts: AyrsharePost[];
  draftingHint: string;
}

export type AyrshareQueueView = "queue" | "analytics";

export const reviewAyrshareQueueInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    view: {
      type: "string",
      enum: ["queue", "analytics"],
      description: "Which Ayrshare data to read: scheduled/queued posts ('queue') or post analytics ('analytics'). Defaults to queue."
    }
  }
} as const;

export interface ReviewAyrshareQueueInput {
  view?: AyrshareQueueView;
}

export function normalizeReviewAyrshareQueueInput(input: unknown): ReviewAyrshareQueueInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Ayrshare queue review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.view !== undefined && value.view !== "queue" && value.view !== "analytics") {
    throw new Error("view must be 'queue' or 'analytics'.");
  }

  return {
    view: value.view as AyrshareQueueView | undefined
  };
}

export async function reviewAyrshareQueue(
  input: ReviewAyrshareQueueInput = {},
  fetchImpl: typeof fetch = fetch
): Promise<AyrshareQueueReview> {
  const view = input.view ?? "queue";
  const posts = await fetchPosts(view, fetchImpl);
  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    view,
    posts,
    draftingHint:
      "Use the content-strategy skill to turn approved briefs into a queued-post plan for X and LinkedIn. Return the plan (copy, platforms, and suggested schedule time) for operator approval; do not auto-post or schedule without explicit sign-off."
  };
}

async function fetchPosts(view: AyrshareQueueView, fetchImpl: typeof fetch): Promise<AyrsharePost[]> {
  const apiKey = process.env.AYRSHARE_API_KEY;
  if (!apiKey) throw new Error("AYRSHARE_API_KEY is required");

  const baseUrl = "https://api.ayrshare.com/api";
  const authHeader = { Authorization: `Bearer ${apiKey}` };
  const response =
    view === "analytics"
      ? await fetchImpl(`${baseUrl}/analytics/social`, {
          method: "POST",
          headers: { ...authHeader, "Content-Type": "application/json" },
          body: JSON.stringify({ platforms: ["twitter", "linkedin"] })
        })
      : await fetchImpl(`${baseUrl}/history`, { headers: authHeader });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Ayrshare API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as unknown;
  const rows = extractRows(payload);
  return rows.map((row) => ({
    id: String(row.id ?? row.postId ?? ""),
    status: String(row.status ?? "unknown"),
    platforms: Array.isArray(row.platforms) ? row.platforms.map((p) => String(p)) : [],
    scheduledFor: row.scheduleDate == null ? null : String(row.scheduleDate),
    post: String(row.post ?? "")
  }));
}

function extractRows(payload: unknown): Array<Record<string, unknown>> {
  if (Array.isArray(payload)) return payload as Array<Record<string, unknown>>;
  if (payload && typeof payload === "object") {
    const wrapper = payload as { posts?: unknown; history?: unknown };
    if (Array.isArray(wrapper.history)) return wrapper.history as Array<Record<string, unknown>>;
    if (Array.isArray(wrapper.posts)) return wrapper.posts as Array<Record<string, unknown>>;
  }
  return [];
}
