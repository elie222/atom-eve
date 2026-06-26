import { reviewFailedPayments as reviewPayments } from "../../lib/agents/dunning/stripe.js";

export async function reviewFailedPayments() {
  return reviewPayments();
}
