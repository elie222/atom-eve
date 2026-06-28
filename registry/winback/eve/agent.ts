import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reviews recent Stripe cancellations and at-risk subscriptions and drafts win-back offers for operator approval."
});
