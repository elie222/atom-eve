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

export const reviewGoogleAdsCampaignsInputSchema = {
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

export interface ReviewGoogleAdsCampaignsInput {
  currentDate?: string;
  comparisonDate?: string;
}

export function normalizeReviewGoogleAdsCampaignsInput(input: unknown): ReviewGoogleAdsCampaignsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Google Ads review input must be an object.");
  }

  const value = input as Record<string, unknown>;
  return {
    currentDate: optionalDate(value.currentDate, "currentDate"),
    comparisonDate: optionalDate(value.comparisonDate, "comparisonDate")
  };
}

export async function reviewGoogleAdsCampaigns(input: ReviewGoogleAdsCampaignsInput = {}) {
  const parsed = normalizeReviewGoogleAdsCampaignsInput(input);
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
  const accessToken = await getAccessToken(fetchImpl);
  const [current, previous] = await Promise.all([
    fetchCampaignInsightsForRange(currentRange, accessToken, fetchImpl),
    fetchCampaignInsightsForRange(comparisonRange, accessToken, fetchImpl),
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

// Exchanges the long-lived refresh token for a short-lived bearer access token.
// Building a full OAuth flow inside the agent is impractical, so the operator
// supplies a pre-authorized refresh token and we mint access tokens at runtime.
export async function getAccessToken(fetchImpl: typeof fetch = fetch): Promise<string> {
  const clientId = process.env.GOOGLE_ADS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_ADS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_ADS_REFRESH_TOKEN;
  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      "GOOGLE_ADS_CLIENT_ID, GOOGLE_ADS_CLIENT_SECRET, and GOOGLE_ADS_REFRESH_TOKEN are required"
    );
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetchImpl("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google OAuth token exchange failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  const payload = (await response.json()) as { access_token?: unknown };
  if (typeof payload.access_token !== "string") {
    throw new Error("Google OAuth token exchange did not return an access_token.");
  }
  return payload.access_token;
}

async function fetchCampaignInsightsForRange(
  range: DateRange,
  accessToken: string,
  fetchImpl: typeof fetch
): Promise<RawCampaignInsight[]> {
  const developerToken = process.env.GOOGLE_ADS_DEVELOPER_TOKEN;
  const customerId = process.env.GOOGLE_ADS_CUSTOMER_ID;
  if (!developerToken || !customerId) {
    throw new Error("GOOGLE_ADS_DEVELOPER_TOKEN and GOOGLE_ADS_CUSTOMER_ID are required");
  }

  const id = customerId.replace(/-/g, "");
  const query =
    "SELECT campaign.id, campaign.name, metrics.cost_micros, metrics.conversions " +
    `FROM campaign WHERE segments.date BETWEEN '${range.since}' AND '${range.until}'`;

  const response = await fetchImpl(`https://googleads.googleapis.com/v18/customers/${id}/googleAds:search`, {
    method: "POST",
    headers: {
      authorization: `Bearer ${accessToken}`,
      "developer-token": developerToken,
      "content-type": "application/json",
    },
    body: JSON.stringify({ query }),
  });
  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(`Google Ads API failed: ${response.status} ${response.statusText}${detail ? ` - ${detail}` : ""}`);
  }

  const payload = (await response.json()) as { results?: Array<Record<string, unknown>> };
  return (payload.results ?? []).map((row) => {
    const campaign = (row.campaign ?? {}) as Record<string, unknown>;
    const metrics = (row.metrics ?? {}) as Record<string, unknown>;
    const spend = Number(metrics.costMicros ?? metrics.cost_micros ?? 0) / 1_000_000;
    const conversions = Number(metrics.conversions ?? 0);
    return {
      campaignId: String(campaign.id ?? ""),
      campaignName: String(campaign.name ?? "Untitled campaign"),
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
          "Spending with no conversions. Review search terms, add negative keywords for irrelevant queries, and consider lowering the budget or pausing low-quality keywords. No campaign changes were made.",
      };
    }

    if (item.cpa !== null && item.cpa > 75 && (item.cpaChangePct ?? 0) > 20) {
      return {
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        severity: "action",
        recommendation:
          "CPA is high and rose more than 20% versus the comparison day. Review the search terms report, add negative keywords, and consider a conservative budget reduction before making changes.",
      };
    }

    if (item.cpa !== null && item.cpa > 75) {
      return {
        campaignId: item.campaignId,
        campaignName: item.campaignName,
        severity: "watch",
        recommendation:
          "CPA is elevated. Review the search terms report for wasteful queries and consider shifting budget toward better converting campaigns after operator approval.",
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
