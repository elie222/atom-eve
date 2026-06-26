import { defineTool } from "eve/tools";
import {
  normalizeReviewRecentIssuesInput,
  reviewRecentIssues,
  reviewRecentIssuesInputSchema
} from "../lib/github.js";

export default defineTool({
  description:
    "Read recent GitHub issues for the configured repository and return a read-only sweep audit.",
  inputSchema: reviewRecentIssuesInputSchema,
  async execute(input: unknown) {
    return reviewRecentIssues(normalizeReviewRecentIssuesInput(input));
  }
});
