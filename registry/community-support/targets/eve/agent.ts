import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reads recent Discord messages and drafts doc-grounded support answers, escalating hard ones."
});
