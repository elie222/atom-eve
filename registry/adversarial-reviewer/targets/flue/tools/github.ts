import {
  normalizeReviewPullRequestInput,
  reviewPullRequest as runReview
} from "../../lib/agents/adversarial-reviewer/github.js";

export async function reviewPullRequest(input: unknown) {
  return runReview(normalizeReviewPullRequestInput(input));
}
