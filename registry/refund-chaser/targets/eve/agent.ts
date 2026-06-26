import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Tracks open Stripe refunds and disputes and drafts the next follow-up for operator approval."
});
