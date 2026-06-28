import { reviewRevenue as runReviewRevenue } from "../../lib/agents/revenue-digest/stripe.js";

export async function reviewRevenue() {
  return runReviewRevenue();
}
