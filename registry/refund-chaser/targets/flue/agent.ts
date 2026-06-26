import { defineAgent } from "@flue/runtime";
import { reviewRefunds } from "../tools/refund-chaser/stripe.js";
import { refundChaserInstructions } from "../lib/agents/refund-chaser/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: refundChaserInstructions,
  tools: [reviewRefunds]
}));
