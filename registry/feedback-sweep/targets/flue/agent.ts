import { defineAgent } from "@flue/runtime";
import { reviewIssues } from "../tools/feedback-sweep/github.js";
import { feedbackSweepInstructions } from "../lib/agents/feedback-sweep/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: feedbackSweepInstructions,
  tools: [reviewIssues]
}));
