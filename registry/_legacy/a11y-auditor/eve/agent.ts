import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Crawls configured key pages, runs axe-style accessibility checks in a real browser, and reports WCAG violations grouped by user harm with proposed read-only fixes."
});
