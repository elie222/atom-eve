import { defineAgent } from "@flue/runtime";
import { uxReviewerInstructions } from "../lib/agents/ux-reviewer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: uxReviewerInstructions
}));
