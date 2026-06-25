import { fetchCampaignInsights, recommendCampaignActions } from "../../lib/agents/facebook-ads/facebook.js";

export async function reviewFacebookCampaigns() {
  const insights = await fetchCampaignInsights();
  return {
    insights,
    recommendations: recommendCampaignActions(insights)
  };
}
