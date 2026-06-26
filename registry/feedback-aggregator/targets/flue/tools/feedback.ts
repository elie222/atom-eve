import {
  aggregateFeedback as aggregate,
  normalizeAggregateFeedbackInput
} from "../../lib/agents/feedback-aggregator/feedback.js";

export async function aggregateFeedback(input: unknown) {
  return aggregate(normalizeAggregateFeedbackInput(input));
}
