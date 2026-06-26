import { defineAgent } from "@flue/runtime";
import { visualRegressionInstructions } from "../lib/agents/visual-regression/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: visualRegressionInstructions
}));
