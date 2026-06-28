import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Monitors target subreddits and keywords, ranks relevant threads by fit and reach, and drafts non-spammy replies for operator approval."
});
