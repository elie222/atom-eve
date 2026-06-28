import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Plans a read-only scan for disallowed and PII production data and drafts the guards to prevent recurrence for operator approval."
});
