import { defineAgent } from "@flue/runtime";
import { reviewGoogleAdsCampaigns } from "../tools/google-ads/googleAds.js";
import { googleAdsInstructions } from "../lib/agents/google-ads/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: googleAdsInstructions,
  tools: [reviewGoogleAdsCampaigns]
}));
