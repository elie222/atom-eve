export interface ResendAudience {
  id: string;
  name: string;
  createdAt: string;
}

export interface ResendAudienceReview {
  generatedAt: string;
  mode: "read_only_draft";
  audiences: ResendAudience[];
  draftingHint: string;
}

export const reviewResendAudienceInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {}
} as const;

export async function reviewResendAudience(fetchImpl: typeof fetch = fetch): Promise<ResendAudienceReview> {
  const audiences = await fetchAudiences(fetchImpl);
  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    audiences,
    draftingHint:
      "Use the copywriting skill to draft the next lifecycle or broadcast email for these audiences. Present drafts for operator approval; do not send without explicit sign-off."
  };
}

export async function fetchAudiences(fetchImpl: typeof fetch = fetch): Promise<ResendAudience[]> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY is required");

  const response = await fetchImpl("https://api.resend.com/audiences", {
    headers: { Authorization: `Bearer ${apiKey}` }
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Resend API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
  }

  const payload = (await response.json()) as { data?: Array<{ id?: unknown; name?: unknown; created_at?: unknown }> };
  const rows = Array.isArray(payload.data) ? payload.data : [];
  return rows.map((row) => ({
    id: String(row.id ?? ""),
    name: String(row.name ?? "Untitled audience"),
    createdAt: String(row.created_at ?? "")
  }));
}
