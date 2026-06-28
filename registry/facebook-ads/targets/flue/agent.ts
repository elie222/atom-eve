import { defineAgent } from "@flue/runtime";
import { reviewFacebookCampaigns } from "../tools/facebook-ads/facebook.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewFacebookCampaigns]
}));
