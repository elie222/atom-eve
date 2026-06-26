import { defineAgent } from "@flue/runtime";
import { reviewPullRequests } from "../tools/code-reviewer/github.js";
import { codeReviewerInstructions } from "../lib/agents/code-reviewer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: codeReviewerInstructions,
  tools: [reviewPullRequests]
}));
