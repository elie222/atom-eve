import { defineTool } from "eve/tools";
import {
  planRestoreCheck,
  normalizePlanRestoreCheckInput,
  planRestoreCheckInputSchema
} from "../lib/backup.js";

export default defineTool({
  description:
    "Draft clean-room restore-and-verify steps for the required recovery scenarios and report gaps in the described backup setup. Read-only.",
  inputSchema: planRestoreCheckInputSchema,
  async execute(input: unknown) {
    return planRestoreCheck(normalizePlanRestoreCheckInput(input));
  }
});
