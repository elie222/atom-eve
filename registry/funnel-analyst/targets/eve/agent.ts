import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Builds PostHog funnels and retention views, finds the biggest drop-offs, and recommends where to focus."
});
