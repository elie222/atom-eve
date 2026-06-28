import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Summarizes a Fireflies meeting transcript into notes, decisions, and action items, then drafts follow-ups for operator approval."
});
