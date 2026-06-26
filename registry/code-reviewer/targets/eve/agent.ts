import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Reviews open GitHub pull requests and drafts read-only correctness and simplification notes."
});
