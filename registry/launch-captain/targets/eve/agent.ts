import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Plans and prepares a draft-first Product Hunt, Hacker News, or launch-day playbook for operator approval."
});
