import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Audits supplied URLs or sitemaps for practical SEO issues, compares against local history, and writes concise Markdown reports."
});
