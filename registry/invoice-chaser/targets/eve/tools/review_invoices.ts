import { defineTool } from "eve/tools";
import {
  normalizeReviewOverdueInvoicesInput,
  reviewOverdueInvoices,
  reviewOverdueInvoicesInputSchema
} from "../lib/stripe.js";

export default defineTool({
  description:
    "Review the project's open Stripe invoices and return overdue invoices, an aging summary, and escalating reminder drafts.",
  inputSchema: reviewOverdueInvoicesInputSchema,
  async execute(input: unknown) {
    return reviewOverdueInvoices(normalizeReviewOverdueInvoicesInput(input));
  }
});
