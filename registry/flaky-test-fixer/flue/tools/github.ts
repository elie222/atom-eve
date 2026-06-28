import { reviewCiRuns as runCiReview } from "../../lib/agents/flaky-test-fixer/github.js";

export async function reviewCiRuns() {
  return runCiReview();
}
