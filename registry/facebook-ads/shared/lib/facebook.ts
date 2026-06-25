import { z } from "zod";

export interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  conversions: number;
  cpa: number | null;
}

export interface CampaignRecommendation {
  campaignId: string;
  campaignName: string;
  severity: "info" | "watch" | "action";
  recommendation: string;
}

export const reviewFacebookCampaignsInputSchema = z.object({});

export type ReviewFacebookCampaignsInput = z.infer<typeof reviewFacebookCampaignsInputSchema>;

export async function reviewFacebookCampaigns(_input: ReviewFacebookCampaignsInput = {}) {
  const insights = await fetchCampaignInsights();
  return {
    insights,
    recommendations: recommendCampaignActions(insights),
  };
}

export async function fetchCampaignInsights(fetchImpl: typeof fetch = fetch): Promise<CampaignInsight[]> {
  const token = process.env.FB_ACCESS_TOKEN;
  const accountId = process.env.FB_AD_ACCOUNT_ID;
  if (!token || !accountId) {
    throw new Error("FB_ACCESS_TOKEN and FB_AD_ACCOUNT_ID are required");
  }

  const fields = "campaign_id,campaign_name,spend,actions";
  const url = new URL(`https://graph.facebook.com/v21.0/${accountId}/insights`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("date_preset", "yesterday");
  url.searchParams.set("access_token", token);

  const response = await fetchImpl(url);
  if (!response.ok) {
    throw new Error(`Facebook Ads API failed: ${response.status} ${response.statusText}`);
  }

  const payload = (await response.json()) as { data?: Array<Record<string, unknown>> };
  return (payload.data ?? []).map((row) => {
    const conversions = extractConversions(row.actions);
    const spend = Number(row.spend ?? 0);
    return {
      campaignId: String(row.campaign_id ?? ""),
      campaignName: String(row.campaign_name ?? "Untitled campaign"),
      spend,
      conversions,
      cpa: conversions > 0 ? spend / conversions : null
    };
  });
}

export function recommendCampaignActions(insights: CampaignInsight[]): CampaignRecommendation[] {
  return insights.map((item) => {
    if (item.spend > 100 && item.conversions === 0) {
      return {
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        severity: "action",
        recommendation: "Pause or narrow this campaign until conversion tracking and creative quality are reviewed."
      };
    }

    if (item.cpa !== null && item.cpa > 75) {
      return {
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        severity: "watch",
        recommendation: "CPA is elevated. Review audience overlap and move budget toward better converting ad sets."
      };
    }

    return {
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      severity: "info",
      recommendation: "No urgent action. Keep monitoring spend and conversion volume."
    };
  });
}

function extractConversions(actions: unknown): number {
  if (!Array.isArray(actions)) return 0;
  const conversion = actions.find((action) => {
    if (!action || typeof action !== "object") return false;
    return String((action as { action_type?: unknown }).action_type ?? "").includes("purchase");
  }) as { value?: unknown } | undefined;
  return Number(conversion?.value ?? 0);
}
