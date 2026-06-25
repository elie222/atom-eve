import { defineTool } from "eve/tools";
import {
  reviewFacebookCampaigns,
  reviewFacebookCampaignsInputSchema,
  type ReviewFacebookCampaignsInput,
} from "../lib/facebook.js";

export default defineTool({
  description: "Review yesterday's Facebook Ads campaign performance and return recommended actions.",
  inputSchema: reviewFacebookCampaignsInputSchema,
  async execute(input: ReviewFacebookCampaignsInput) {
    return reviewFacebookCampaigns(input);
  }
});
