import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Reviews recent GitHub Actions CI runs to surface repeatedly-failing or retried tests and diagnose likely flakes (read-only)."
});
