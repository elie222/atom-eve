import { defineAgent } from "@flue/runtime";
import { reviewCiRuns } from "../tools/flaky-test-fixer/github.js";
import { flakyTestFixerInstructions } from "../lib/agents/flaky-test-fixer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: flakyTestFixerInstructions,
  tools: [reviewCiRuns]
}));
