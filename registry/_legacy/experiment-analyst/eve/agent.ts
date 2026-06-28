import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews PostHog A/B experiments, checks significance, calls winners, and summarizes learnings."
});
