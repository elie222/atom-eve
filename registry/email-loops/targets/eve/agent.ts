import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews the Loops audience and drafts lifecycle and broadcast email for operator approval."
});
