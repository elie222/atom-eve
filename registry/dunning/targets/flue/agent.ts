import { defineAgent } from "@flue/runtime";
import { reviewFailedPayments } from "../tools/dunning/stripe.js";
import { dunningInstructions } from "../lib/agents/dunning/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: dunningInstructions,
  tools: [reviewFailedPayments]
}));
