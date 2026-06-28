import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Plans a read-only audit to find every stale copy of a changed value across code, docs, and config, then proposes a per-file fix diff for operator approval."
});
