import { defineAgent } from "@flue/runtime";
import { reviewRevenue } from "../tools/revenue-digest/stripe.js";
import { revenueDigestInstructions } from "../lib/agents/revenue-digest/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: revenueDigestInstructions,
  tools: [reviewRevenue]
}));
