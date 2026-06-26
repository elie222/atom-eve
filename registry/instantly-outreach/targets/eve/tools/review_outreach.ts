import { defineTool } from "eve/tools";
import {
  normalizeReviewOutreachInput,
  reviewOutreach,
  reviewOutreachInputSchema
} from "../lib/outreach.js";

export default defineTool({
  description:
    "Pull fresh ICP leads from Apollo and recent Instantly campaign performance, and return a draft plan for the next cold-email campaign. Read-only: it does not create or launch anything.",
  inputSchema: reviewOutreachInputSchema,
  async execute(input: unknown) {
    return reviewOutreach(normalizeReviewOutreachInput(input));
  }
});
