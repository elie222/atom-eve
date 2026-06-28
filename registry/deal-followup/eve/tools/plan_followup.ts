import { defineTool } from "eve/tools";
import {
  normalizePlanDealFollowupInput,
  planDealFollowup,
  planDealFollowupInputSchema
} from "../lib/followup.js";

export default defineTool({
  description:
    "Parse a sales-call transcript and return a recap-email scaffold, extracted next steps, and draft CRM field updates.",
  inputSchema: planDealFollowupInputSchema,
  async execute(input: unknown) {
    return planDealFollowup(normalizePlanDealFollowupInput(input));
  }
});
