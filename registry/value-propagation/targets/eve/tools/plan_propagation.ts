import { defineTool } from "eve/tools";
import {
  planValuePropagation,
  normalizePlanValuePropagationInput,
  planValuePropagationInputSchema
} from "../lib/propagation.js";

export default defineTool({
  description: "Plan a read-only audit and fix plan for propagating a changed value (oldValue -> newValue) across code, docs, and config.",
  inputSchema: planValuePropagationInputSchema,
  async execute(input: unknown) {
    return planValuePropagation(normalizePlanValuePropagationInput(input));
  }
});
