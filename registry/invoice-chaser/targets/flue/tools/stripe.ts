import { reviewOverdueInvoices } from "../../lib/agents/invoice-chaser/stripe.js";

export async function reviewInvoices() {
  return reviewOverdueInvoices();
}
