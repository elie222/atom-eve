import { reviewSpend as reviewStripeSpend } from "../../lib/agents/spend-tracker/stripe.js";

export async function reviewSpend() {
  return reviewStripeSpend();
}
