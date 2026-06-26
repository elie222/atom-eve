import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Checks operator-supplied endpoints for status, latency, and expected content, then reports a read-only health summary."
});
