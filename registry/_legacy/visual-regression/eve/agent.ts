import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Snapshots key screens with a native browser, compares them against a saved baseline, and returns a concise Markdown report of unintended UI diffs (read-only)."
});
