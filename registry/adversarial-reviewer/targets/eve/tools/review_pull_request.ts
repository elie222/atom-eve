import { defineTool } from "eve/tools";
import {
  normalizeReviewPullRequestInput,
  reviewPullRequest,
  reviewPullRequestInputSchema
} from "../lib/github.js";

export default defineTool({
  description:
    "Read a GitHub pull request and its unified diff and return a read-only payload for an adversarial second-opinion review.",
  inputSchema: reviewPullRequestInputSchema,
  async execute(input: unknown) {
    return reviewPullRequest(normalizeReviewPullRequestInput(input));
  }
});
