import { defineAgent } from "@flue/runtime";
import { planPropagation } from "../tools/value-propagation/propagation.js";
import { valuePropagationInstructions } from "../lib/agents/value-propagation/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: valuePropagationInstructions,
  tools: [planPropagation]
}));
