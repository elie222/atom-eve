import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Finds users stuck before activation in PostHog and drafts the right nudge for each onboarding step."
});
