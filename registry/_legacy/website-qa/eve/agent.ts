import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Runs browser-driven QA on web app flows such as signup and onboarding, captures evidence, and returns concise Markdown reports."
});
