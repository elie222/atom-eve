import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Acts like a first-time developer following the project's README and clean setup using native sandbox and browser capabilities, stops at the first blocker, and reports the exact doc or script fix needed without changing anything."
});
