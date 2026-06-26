import { defineAgent } from "@flue/runtime";
import { croOptimizerInstructions } from "../lib/agents/cro-optimizer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: croOptimizerInstructions
}));
