import { defineAgent } from "@flue/runtime";
import { planCleanup } from "../tools/repo-janitor/janitor.js";
import { repoJanitorInstructions } from "../lib/agents/repo-janitor/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: repoJanitorInstructions,
  tools: [planCleanup]
}));
