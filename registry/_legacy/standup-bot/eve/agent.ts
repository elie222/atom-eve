import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reads recent Slack channel updates and drafts a daily standup digest for operator approval."
});
