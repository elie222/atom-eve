import { defineTool } from "eve/tools";
import {
  planComplianceScan,
  normalizePlanComplianceScanInput,
  planComplianceScanInputSchema
} from "../lib/compliance.js";

export default defineTool({
  description: "Draft a read-only scan for disallowed and PII data plus the guards to prevent recurrence. Does not read or delete any data.",
  inputSchema: planComplianceScanInputSchema,
  async execute(input: unknown) {
    return planComplianceScan(normalizePlanComplianceScanInput(input));
  }
});
