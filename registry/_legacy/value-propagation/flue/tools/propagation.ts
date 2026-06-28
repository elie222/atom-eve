import {
  planValuePropagation,
  normalizePlanValuePropagationInput
} from "../../lib/agents/value-propagation/propagation.js";

export async function planPropagation(input: unknown) {
  return planValuePropagation(normalizePlanValuePropagationInput(input));
}
