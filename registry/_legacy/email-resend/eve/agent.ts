import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews Resend audiences and drafts lifecycle and broadcast email for operator approval."
});
