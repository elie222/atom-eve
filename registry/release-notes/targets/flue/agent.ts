import { defineAgent } from "@flue/runtime";
import { reviewMerged } from "../tools/release-notes/github.js";
import { releaseNotesInstructions } from "../lib/agents/release-notes/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: releaseNotesInstructions,
  tools: [reviewMerged]
}));
