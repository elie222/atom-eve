import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Classifies the Gmail inbox, flags noise to label or archive, and drafts replies for operator approval."
});
