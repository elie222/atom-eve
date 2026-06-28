import { defineTool } from "eve/tools";
import { draftResponses, draftResponsesInputSchema, normalizeDraftResponsesInput } from "../lib/reviews.js";

export default defineTool({
  description:
    "Classify the sentiment of new reviews, flag detractors, and return a draft-first response plan per review.",
  inputSchema: draftResponsesInputSchema,
  async execute(input: unknown) {
    return draftResponses(normalizeDraftResponsesInput(input));
  }
});
