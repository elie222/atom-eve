import { defineTool } from "eve/tools";
import {
  normalizeReviewMergedPullRequestsInput,
  reviewMergedPullRequests,
  reviewMergedPullRequestsInputSchema
} from "../lib/github.js";

export default defineTool({
  description:
    "Review pull requests merged since the latest release and return draft release notes grouped by change type.",
  inputSchema: reviewMergedPullRequestsInputSchema,
  async execute(input: unknown) {
    return reviewMergedPullRequests(normalizeReviewMergedPullRequestsInput(input));
  }
});
