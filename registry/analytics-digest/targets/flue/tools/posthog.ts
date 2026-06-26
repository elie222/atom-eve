import { reviewTrends as reviewPosthogTrends } from "../../lib/agents/analytics-digest/posthog.js";

export async function reviewTrends() {
  return reviewPosthogTrends();
}
