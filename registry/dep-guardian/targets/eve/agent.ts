import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews a repository's package.json dependencies from GitHub and flags outdated or risky packages for operator approval."
});
