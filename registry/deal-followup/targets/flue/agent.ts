import { defineAgent } from "@flue/runtime";
import { planFollowup } from "../tools/deal-followup/followup.js";
import { dealFollowupInstructions } from "../lib/agents/deal-followup/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: dealFollowupInstructions,
  tools: [planFollowup]
}));
