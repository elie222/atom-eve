import { defineAgent } from "eve";

export default defineAgent({
  model: process.env.AGENT_MODEL ?? "anthropic/claude-sonnet-4.6",
  description:
    "Audits landing pages with native Agent Browser and conversion heuristics, then proposes ranked A/B test ideas with hypotheses (read-only)."
});
