import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Summarizes MRR, new/churn, and top accounts from Stripe into a weekly read-only digest."
});
