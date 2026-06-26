import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Pulls key event trends from PostHog and writes a plain-language weekly digest."
});
