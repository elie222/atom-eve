import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Assembles Stripe revenue KPIs and PostHog product KPIs into one weekly read-only digest."
});
