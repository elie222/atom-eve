import { defineTool } from "eve/tools";
import { reviewRefunds, reviewRefundsInputSchema } from "../lib/stripe.js";

export default defineTool({
  description: "Review open Stripe refunds and disputes and return a draft-ready follow-up summary.",
  inputSchema: reviewRefundsInputSchema,
  async execute(_input: unknown) {
    return reviewRefunds();
  }
});
