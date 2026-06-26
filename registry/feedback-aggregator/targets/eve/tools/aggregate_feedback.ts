import { defineTool } from "eve/tools";
import {
  aggregateFeedback,
  aggregateFeedbackInputSchema,
  normalizeAggregateFeedbackInput
} from "../lib/feedback.js";

export default defineTool({
  description: "Dedupe feedback items into themes and rank them by frequency x value. Read-only planner.",
  inputSchema: aggregateFeedbackInputSchema,
  async execute(input: unknown) {
    return aggregateFeedback(normalizeAggregateFeedbackInput(input));
  }
});
