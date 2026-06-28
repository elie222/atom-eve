import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Turns a long transcript or topic into a draft plan of short vertical clips with hooks, captions, and rationale for operator approval."
});
