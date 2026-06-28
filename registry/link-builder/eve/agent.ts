import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Finds backlink and guest-post prospects for a topic and drafts personalized outreach for operator approval."
});
