import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description: "Identifies untested paths in provided code and drafts meaningful test cases and assertions for operator approval."
});
