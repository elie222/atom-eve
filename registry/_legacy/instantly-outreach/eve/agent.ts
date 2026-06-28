import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Pulls fresh ICP leads from Apollo, reviews Instantly campaign performance, and drafts cold-email campaigns for operator approval."
});
