import { reviewDependencies as runReview } from "../../lib/agents/dep-guardian/github.js";

export async function reviewDependencies() {
  return runReview();
}
