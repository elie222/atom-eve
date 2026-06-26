import { defineAgent } from "@flue/runtime";
import { reviewFacebookCampaigns } from "../tools/facebook-ads/facebook.js";
import { facebookAdsInstructions } from "../lib/agents/facebook-ads/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: facebookAdsInstructions,
  tools: [reviewFacebookCampaigns]
}));
