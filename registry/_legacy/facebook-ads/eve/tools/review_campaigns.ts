import { defineTool } from "eve/tools";
import {
  normalizeReviewFacebookCampaignsInput,
  reviewFacebookCampaigns,
  reviewFacebookCampaignsInputSchema
} from "../lib/facebook.js";

export default defineTool({
  description: "Review yesterday's Facebook Ads campaign performance and return recommended actions.",
  inputSchema: reviewFacebookCampaignsInputSchema,
  async execute(input: unknown) {
    return reviewFacebookCampaigns(normalizeReviewFacebookCampaignsInput(input));
  }
});
