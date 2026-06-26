import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Crawls the configured marketing site weekly using native browser, fetch, and sandbox capabilities, inventories every customer-facing claim, verifies each against product reality, and drafts repairs for the riskiest overstatements (read-only)."
});
