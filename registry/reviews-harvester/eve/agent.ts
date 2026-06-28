import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Watches new product reviews from the configured source, drafts on-brand responses, and flags detractors for operator approval."
});
