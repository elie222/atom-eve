import { reviewFunnels as runReviewFunnels } from "../../lib/agents/funnel-analyst/posthog.js";

export async function reviewFunnels() {
  return runReviewFunnels();
}
