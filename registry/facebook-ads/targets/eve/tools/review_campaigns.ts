import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchCampaignInsights, recommendCampaignActions } from "../lib/facebook.js";

export default defineTool({
  description: "Review yesterday's Facebook Ads campaign performance and return recommended actions.",
  inputSchema: z.object({}),
  async execute() {
    const insights = await fetchCampaignInsights();
    return {
      insights,
      recommendations: recommendCampaignActions(insights)
    };
  }
});
