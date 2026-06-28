import { defineAgent } from "@flue/runtime";
import { reviewIssues } from "../tools/feedback-sweep/github.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewIssues]
}));
