import { defineAgent } from "@flue/runtime";
import { improveCopy } from "../tools/microcopy/microcopy.js";
import { microcopyInstructions } from "../lib/agents/microcopy/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: microcopyInstructions,
  tools: [improveCopy]
}));
