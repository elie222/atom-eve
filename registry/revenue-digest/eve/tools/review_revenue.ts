import { defineTool } from "eve/tools";
import {
  normalizeReviewRevenueInput,
  reviewRevenue,
  reviewRevenueInputSchema
} from "../lib/stripe.js";

export default defineTool({
  description: "Read Stripe subscriptions and invoices and return a weekly revenue digest summary.",
  inputSchema: reviewRevenueInputSchema,
  async execute(input: unknown) {
    return reviewRevenue(normalizeReviewRevenueInput(input));
  }
});
