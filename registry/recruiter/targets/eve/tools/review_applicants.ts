import { defineTool } from "eve/tools";
import {
  normalizeReviewApplicantsInput,
  reviewApplicants,
  reviewApplicantsInputSchema
} from "../lib/ashby.js";

export default defineTool({
  description: "Review the latest Ashby applicants and return a draft-ready, read-only candidate summary for scoring and shortlisting.",
  inputSchema: reviewApplicantsInputSchema,
  async execute(input: unknown) {
    return reviewApplicants(normalizeReviewApplicantsInput(input));
  }
});
