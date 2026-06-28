import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Categorizes recent Stripe charges and flags duplicate or unused SaaS and anomalies for operator review."
});
