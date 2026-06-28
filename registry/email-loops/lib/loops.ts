export interface LoopsMailingList {
  id: string;
  name: string;
  description: string | null;
  isPublic: boolean;
}

export interface LoopsAudienceReview {
  generatedAt: string;
  mode: "read_only_draft";
  lists: LoopsMailingList[];
  draftingHint: string;
}

export const reviewLoopsAudienceInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {}
} as const;

export async function reviewLoopsAudience(fetchImpl: typeof fetch = fetch): Promise<LoopsAudienceReview> {
  const lists = await fetchMailingLists(fetchImpl);
  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    lists,
    draftingHint:
      "Use the copywriting skill to draft the next lifecycle or broadcast email for these lists. Present drafts for operator approval; do not send without explicit sign-off."
  };
}

export async function fetchMailingLists(fetchImpl: typeof fetch = fetch): Promise<LoopsMailingList[]> {
  const apiKey = process.env.LOOPS_API_KEY;
  if (!apiKey) throw new Error("LOOPS_API_KEY is required");

  const response = await fetchImpl("https://app.loops.so/api/v1/lists", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Loops API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? "Untitled list"),
    description: row.description == null ? null : String(row.description),
    isPublic: Boolean(row.isPublic)
  }));
}
