import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Plans proven low-risk repository cleanups one at a time (stale files, dead code, lint debt) and leaves uncertain work alone. Read-only and draft-first."
});
