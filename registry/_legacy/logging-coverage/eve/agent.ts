import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Finds logging gaps on important code paths and drafts structured log statements to add for operator approval, read-only."
});
