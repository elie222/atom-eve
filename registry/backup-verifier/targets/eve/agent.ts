import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Drafts clean-room restore-and-verify plans for required recovery scenarios and reports backup coverage gaps for operator review (read-only)."
});
