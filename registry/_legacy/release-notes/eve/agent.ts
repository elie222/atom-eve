import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reviews pull requests merged since the latest release and drafts user-facing release notes for operator approval."
});
