import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Iterates YouTube and social thumbnail concepts with fal.ai and self-scores each against a clarity and no-clickbait bar for operator approval."
});
