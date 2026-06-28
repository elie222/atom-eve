import { defineTool } from "eve/tools";
import {
  normalizeReviewGoogleAdsCampaignsInput,
  reviewGoogleAdsCampaigns,
  reviewGoogleAdsCampaignsInputSchema
} from "../lib/googleAds.js";

export default defineTool({
  description: "Review recent Google Ads campaign performance and return recommended actions.",
  inputSchema: reviewGoogleAdsCampaignsInputSchema,
  async execute(input: unknown) {
    return reviewGoogleAdsCampaigns(normalizeReviewGoogleAdsCampaignsInput(input));
  }
});
