import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reviews recent commits and merged pull requests and proposes a reviewable update for drifted documentation."
});
