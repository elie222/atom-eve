import {
  normalizePlanDealFollowupInput,
  planDealFollowup
} from "../../lib/agents/deal-followup/followup.js";

export async function planFollowup(input: unknown) {
  return planDealFollowup(normalizePlanDealFollowupInput(input));
}
