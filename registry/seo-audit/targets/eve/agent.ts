import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Helps improve SEO by reviewing the configured site, finding content and metadata fixes, and tracking progress week to week."
});
