import { draftResponses as draftReviewResponses, normalizeDraftResponsesInput } from "../../lib/agents/reviews-harvester/reviews.js";

export async function draftResponses(input: unknown) {
  return draftReviewResponses(normalizeDraftResponsesInput(input));
}
