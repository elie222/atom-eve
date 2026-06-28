import { defineAgent } from "@flue/runtime";
import { reviewRefunds } from "../tools/refund-chaser/stripe.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewRefunds]
}));
