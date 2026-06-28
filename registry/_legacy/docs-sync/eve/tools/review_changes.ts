import { defineTool } from "eve/tools";
import {
  normalizeReviewRecentChangesInput,
  reviewRecentChanges,
  reviewRecentChangesInputSchema
} from "../lib/github.js";

export default defineTool({
  description:
    "Review recent commits and merged pull requests and flag documentation that has likely drifted from the code.",
  inputSchema: reviewRecentChangesInputSchema,
  async execute(input: unknown) {
    return reviewRecentChanges(normalizeReviewRecentChangesInput(input));
  }
});
