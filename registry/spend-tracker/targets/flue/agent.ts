import { defineAgent } from "@flue/runtime";
import { reviewSpend } from "../tools/spend-tracker/stripe.js";
import { spendTrackerInstructions } from "../lib/agents/spend-tracker/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: spendTrackerInstructions,
  tools: [reviewSpend]
}));
