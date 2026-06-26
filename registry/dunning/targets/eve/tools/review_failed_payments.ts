import { defineTool } from "eve/tools";
import {
  normalizeReviewFailedPaymentsInput,
  reviewFailedPayments,
  reviewFailedPaymentsInputSchema
} from "../lib/stripe.js";

export default defineTool({
  description:
    "Read recent Stripe charges to find failed payments and expiring cards, and return draft recovery email stages.",
  inputSchema: reviewFailedPaymentsInputSchema,
  async execute(input: unknown) {
    return reviewFailedPayments(normalizeReviewFailedPaymentsInput(input));
  }
});
