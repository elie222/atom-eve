import { defineAgent } from "@flue/runtime";
import { claimCheckerInstructions } from "../lib/agents/claim-checker/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: claimCheckerInstructions
}));
