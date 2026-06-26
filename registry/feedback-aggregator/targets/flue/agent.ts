import { defineAgent } from "@flue/runtime";
import { aggregateFeedback } from "../tools/feedback-aggregator/feedback.js";
import { feedbackAggregatorInstructions } from "../lib/agents/feedback-aggregator/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: feedbackAggregatorInstructions,
  tools: [aggregateFeedback]
}));
