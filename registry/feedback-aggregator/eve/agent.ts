import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Dedupes feedback from tickets, reviews, and community into themes ranked by frequency x value for operator review."
});
