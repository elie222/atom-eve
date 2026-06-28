import { defineAgent } from "@flue/runtime";
import { reviewPullRequests } from "../tools/code-reviewer/github.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewPullRequests]
}));
