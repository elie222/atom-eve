import { defineTool } from "eve/tools";
import {
  planLogging,
  normalizePlanLoggingInput,
  planLoggingInputSchema
} from "../lib/logging.js";

export default defineTool({
  description: "Scan supplied code or a critical-path description for logging gaps and return draft structured log statements to add.",
  inputSchema: planLoggingInputSchema,
  async execute(input: unknown) {
    return planLogging(normalizePlanLoggingInput(input));
  }
});
