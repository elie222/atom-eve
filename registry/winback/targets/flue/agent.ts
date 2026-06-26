import { defineAgent } from "@flue/runtime";
import { reviewChurn } from "../tools/winback/stripe.js";
import { winbackInstructions } from "../lib/agents/winback/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: winbackInstructions,
  tools: [reviewChurn]
}));
