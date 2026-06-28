export interface CampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  conversions: number;
  cpa: number | null;
  previousSpend: number;
  previousConversions: number;
  previousCpa: number | null;
  spendChangePct: number | null;
  conversionChangePct: number | null;
  cpaChangePct: number | null;
}

export interface CampaignRecommendation {
  campaignId: string;
  campaignName: string;
  severity: "info" | "watch" | "action";
  recommendation: string;
}

interface RawCampaignInsight {
  campaignId: string;
  campaignName: string;
  spend: number;
  conversions: number;
  cpa: number | null;
}

export interface DateRange {
  since: string;
  until: string;
}

export const reviewFacebookCampaignsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    currentDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "UTC date to inspect in YYYY-MM-DD format. Defaults to yesterday."
    },
    comparisonDate: {
      type: "string",
      pattern: "^\\d{4}-\\d{2}-\\d{2}$",
      description: "UTC date to compare against in YYYY-MM-DD format. Defaults to two days ago."
    }
  }
} as const;

export interface ReviewFacebookCampaignsInput {
  currentDate?: string;
  comparisonDate?: string;
}

export function normalizeReviewFacebookCampaignsInput(input: unknown): ReviewFacebookCampaignsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Facebook Ads review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    currentDate: optionalDate(value.currentDate, "currentDate"),
    comparisonDate: optionalDate(value.comparisonDate, "comparisonDate")
  };
}

export async function reviewFacebookCampaigns(input: ReviewFacebookCampaignsInput = {}) {
  const parsed = normalizeReviewFacebookCampaignsInput(input);
  const currentDate = parsed.currentDate ?? offsetDate(-1);
  const comparisonDate = parsed.comparisonDate ?? shiftDate(currentDate, -1);
  const currentRange = dateToRange(currentDate);
  const comparisonRange = dateToRange(comparisonDate);
  const insights = await fetchCampaignInsights(currentRange, comparisonRange);

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_recommendations",
    dataWindow: {
      current: currentRange,
      comparison: comparisonRange,
    },
    insights,
    recommendations: recommendCampaignActions(insights),
    runHistoryHint:
      "Save this response with your prior daily runs if you want trend notes beyond the built-in previous-day comparison.",
  };
}

export async function fetchCampaignInsights(
  currentRange: DateRange = dateToRange(offsetDate(-1)),
  comparisonRange: DateRange = dateToRange(offsetDate(-2)),
  fetchImpl: typeof fetch = fetch
): Promise<CampaignInsight[]> {
  const [current, previous] = await Promise.all([
    fetchCampaignInsightsForRange(currentRange, fetchImpl),
    fetchCampaignInsightsForRange(comparisonRange, fetchImpl),
  ]);
  const previousById = new Map(previous.map((item) => [item.campaignId, item]));

  return current.map((item) => {
    const comparison = previousById.get(item.campaignId);
    const previousSpend = comparison?.spend ?? 0;
    const previousConversions = comparison?.conversions ?? 0;
    const previousCpa = comparison?.cpa ?? null;

    return {
      ...item,
      previousSpend,
      previousConversions,
      previousCpa,
      spendChangePct: percentChange(item.spend, previousSpend),
      conversionChangePct: percentChange(item.conversions, previousConversions),
      cpaChangePct: previousCpa === null || item.cpa === null ? null : percentChange(item.cpa, previousCpa),
    };
  });
}

async function fetchCampaignInsightsForRange(range: DateRange, fetchImpl: typeof fetch): Promise<RawCampaignInsight[]> {
  const token = process.env.FB_ACCESS_TOKEN;
  const accountId = process.env.FB_AD_ACCOUNT_ID;
  if (!token || !accountId) {
    throw new Error("FB_ACCESS_TOKEN and FB_AD_ACCOUNT_ID are required");
  }

  const fields = "campaign_id,campaign_name,spend,actions";
  const account = accountId.startsWith("act_") ? accountId : `act_${accountId}`;
  const url = new URL(`https://graph.facebook.com/v21.0/${account}/insights`);
  url.searchParams.set("fields", fields);
  url.searchParams.set("level", "campaign");
  url.searchParams.set("time_range", JSON.stringify(range));
  url.searchParams.set("access_token", token);

  const response = await fetchImpl(url);
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`Facebook Ads API failed: ${response.status} ${response.statusText}${body ? ` - ${body}` : ""}`);
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
      cpa: conversions > 0 ? spend / conversions : null,
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
        recommendation:
          "Consider pausing or narrowing this campaign after reviewing conversion tracking and creative quality. No campaign changes were made.",
      };
    }

    if (item.cpa !== null && item.cpa > 75 && (item.cpaChangePct ?? 0) > 20) {
      return {
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        severity: "action",
        recommendation:
          "CPA is high and rose more than 20% versus the comparison day. Review audience overlap, creative fatigue, and budget allocation before making changes.",
      };
    }

    if (item.cpa !== null && item.cpa > 75) {
      return {
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        severity: "watch",
        recommendation:
          "CPA is elevated. Review audience overlap and consider moving budget toward better converting ad sets after operator approval.",
      };
    }

    return {
      campaignId: item.campaignId,
      campaignName: item.campaignName,
      severity: "info",
      recommendation: "No urgent action. Keep monitoring spend and conversion volume.",
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

function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function dateToRange(date: string): DateRange {
  return { since: date, until: date };
}

function offsetDate(days: number): string {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

function shiftDate(date: string, days: number): string {
  const parsed = new Date(`${date}T00:00:00.000Z`);
  parsed.setUTCDate(parsed.getUTCDate() + days);
  return parsed.toISOString().slice(0, 10);
}

function optionalDate(value: unknown, field: string): string | undefined {
  if (value === undefined) return undefined;
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    throw new Error(`${field} must be a YYYY-MM-DD date string.`);
  }
  return value;
}
