import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews Stripe failed charges and expiring cards and drafts a staged recovery email sequence."
});
