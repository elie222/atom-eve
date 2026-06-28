import { defineTool } from "eve/tools";
import {
  normalizeReviewChurnInput,
  reviewChurn,
  reviewChurnInputSchema
} from "../lib/stripe.js";

export default defineTool({
  description:
    "Review recent Stripe cancellations and at-risk subscriptions, segmented by reason, with draft win-back offers.",
  inputSchema: reviewChurnInputSchema,
  async execute(input: unknown) {
    return reviewChurn(normalizeReviewChurnInput(input));
  }
});
