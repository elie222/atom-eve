import { reviewRevenue as reviewRevenueLib } from "../../lib/agents/kpi-digest/stripe.js";

export async function reviewRevenue() {
  return reviewRevenueLib();
}
