import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description:
    "Runs browser-driven QA on web app flows such as signup and onboarding, captures evidence, and writes concise Markdown reports."
});
