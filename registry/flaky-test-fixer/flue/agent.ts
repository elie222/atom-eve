import { defineAgent } from "@flue/runtime";
import { reviewCiRuns } from "../tools/flaky-test-fixer/github.js";

export default defineAgent(() => ({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewCiRuns]
}));
