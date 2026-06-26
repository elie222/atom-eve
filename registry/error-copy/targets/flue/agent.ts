import { defineAgent } from "@flue/runtime";
import { errorCopyInstructions } from "../lib/agents/error-copy/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: errorCopyInstructions
}));
