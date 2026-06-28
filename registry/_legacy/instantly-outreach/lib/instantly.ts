export interface CampaignAnalytics {
  campaignId: string;
  campaignName: string;
  leads: number;
  sent: number;
  opens: number;
  replies: number;
  positiveReplies: number;
  openRate: number | null;
  replyRate: number | null;
  positiveRate: number | null;
}

// Read Instantly campaign analytics. Read-only: this only fetches performance data, it never
// creates, edits, or launches campaigns. https://api.instantly.ai/api/v2 with a Bearer token.
export async function reviewCampaigns(fetchImpl: typeof fetch = fetch): Promise<CampaignAnalytics[]> {
  const apiKey = process.env.INSTANTLY_API_KEY;
  if (!apiKey) throw new Error("INSTANTLY_API_KEY is required");

  const response = await fetchImpl("https://api.instantly.ai/api/v2/campaigns/analytics", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json"
    }
  });
  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(`Instantly API failed: ${response.status} ${response.statusText}${text ? ` - ${text}` : ""}`);
  }

  const payload = (await response.json()) as unknown;
  const rows = Array.isArray(payload) ? (payload as Array<Record<string, unknown>>) : [];
  return rows.map((row) => {
    const sent = Number(row.emails_sent_count ?? 0);
    const opens = Number(row.open_count ?? 0);
    const replies = Number(row.reply_count ?? 0);
    const positiveReplies = Number(row.total_opportunities ?? 0);
    return {
      campaignId: String(row.campaign_id ?? row.id ?? ""),
      campaignName: String(row.campaign_name ?? "Untitled campaign"),
      leads: Number(row.leads_count ?? 0),
      sent,
      opens,
      replies,
      positiveReplies,
      openRate: rate(opens, sent),
      replyRate: rate(replies, sent),
      positiveRate: rate(positiveReplies, replies)
    };
  });
}

export function bestPerformingCampaign(campaigns: CampaignAnalytics[]): CampaignAnalytics | null {
  let best: CampaignAnalytics | null = null;
  for (const campaign of campaigns) {
    if (campaign.sent === 0) continue;
    const score = campaign.positiveRate ?? campaign.replyRate ?? 0;
    const bestScore = best ? (best.positiveRate ?? best.replyRate ?? 0) : -1;
    if (score > bestScore) best = campaign;
  }
  return best;
}

function rate(part: number, whole: number): number | null {
  if (whole <= 0) return null;
  return Math.round((part / whole) * 1000) / 10;
}
