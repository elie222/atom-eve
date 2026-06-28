import { defineAgent } from "@flue/runtime";
import { aggregateFeedback } from "../tools/feedback-aggregator/feedback.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [aggregateFeedback]
}));
