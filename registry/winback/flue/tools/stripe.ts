import { reviewChurn as reviewStripeChurn } from "../../lib/agents/winback/stripe.js";

export async function reviewChurn() {
  return reviewStripeChurn();
}
