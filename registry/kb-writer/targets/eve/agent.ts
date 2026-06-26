import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Clusters recurring Intercom questions and drafts knowledge base articles and doc-gap flags for operator approval."
});
