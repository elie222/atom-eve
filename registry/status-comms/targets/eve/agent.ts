import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Drafts a customer-facing incident status update and a post-mortem outline from provided incident details, for operator approval. Read-only: it never posts."
});
