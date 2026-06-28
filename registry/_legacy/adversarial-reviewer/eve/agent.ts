import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reads a GitHub pull request and its diff and returns an independent, skeptical second-opinion review (read-only)."
});
