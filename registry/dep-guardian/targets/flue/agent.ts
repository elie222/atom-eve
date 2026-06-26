import { defineAgent } from "@flue/runtime";
import { reviewDependencies } from "../tools/dep-guardian/github.js";
import { depGuardianInstructions } from "../lib/agents/dep-guardian/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: depGuardianInstructions,
  tools: [reviewDependencies]
}));
