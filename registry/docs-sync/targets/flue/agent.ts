import { defineAgent } from "@flue/runtime";
import { reviewChanges } from "../tools/docs-sync/github.js";
import { docsSyncInstructions } from "../lib/agents/docs-sync/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: docsSyncInstructions,
  tools: [reviewChanges]
}));
