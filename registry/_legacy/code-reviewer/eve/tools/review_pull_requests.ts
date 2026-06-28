import { defineTool } from "eve/tools";
import {
  normalizeReviewPullRequestsInput,
  reviewOpenPullRequests,
  reviewPullRequestsInputSchema
} from "../lib/github.js";

export default defineTool({
  description: "Review the project's open GitHub pull requests and return read-only correctness and simplification notes.",
  inputSchema: reviewPullRequestsInputSchema,
  async execute(input: unknown) {
    return reviewOpenPullRequests(normalizeReviewPullRequestsInput(input));
  }
});
