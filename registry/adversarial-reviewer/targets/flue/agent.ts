import { defineAgent } from "@flue/runtime";
import { reviewPullRequest } from "../tools/adversarial-reviewer/github.js";
import { adversarialReviewerInstructions } from "../lib/agents/adversarial-reviewer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: adversarialReviewerInstructions,
  tools: [reviewPullRequest]
}));
