import { defineAgent } from "@flue/runtime";
import { reviewFacebookCampaigns } from "../tools/facebook-ads/facebook.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "Review Facebook Ads campaign performance and recommend conservative daily optimization actions.",
  tools: [reviewFacebookCampaigns]
}));
