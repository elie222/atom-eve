import { defineTool } from "eve/tools";
import { normalizeReviewSpendInput, reviewSpend, reviewSpendInputSchema } from "../lib/stripe.js";

export default defineTool({
  description: "Review recent Stripe charges and return categorized spend with duplicate, unused-SaaS, and anomaly flags.",
  inputSchema: reviewSpendInputSchema,
  async execute(input: unknown) {
    return reviewSpend(normalizeReviewSpendInput(input));
  }
});
