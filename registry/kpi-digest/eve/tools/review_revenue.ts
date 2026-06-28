import { defineTool } from "eve/tools";
import { normalizeReviewRevenueInput, reviewRevenue, reviewRevenueInputSchema } from "../lib/stripe.js";

export default defineTool({
  description:
    "Read this week's revenue KPIs from Stripe (MRR, active/new/churned subscriptions, collected revenue, and top accounts) and return them as a read-only digest. Combine with product KPIs read via posthog-cli.",
  inputSchema: reviewRevenueInputSchema,
  async execute(input: unknown) {
    return reviewRevenue(normalizeReviewRevenueInput(input));
  }
});
