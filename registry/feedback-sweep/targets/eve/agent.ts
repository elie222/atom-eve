import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reviews recent GitHub issues as user corrections and audits the project for related spots to fix."
});
