import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reads a Linear ticket and drafts a reviewer-ready reproduction, implementation plan, and test plan for a PR."
});
