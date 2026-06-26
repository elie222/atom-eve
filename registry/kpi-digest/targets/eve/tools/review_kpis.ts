import { defineTool } from "eve/tools";
import { normalizeReviewKpisInput, reviewKpis, reviewKpisInputSchema } from "../lib/kpi.js";

export default defineTool({
  description:
    "Read this week's revenue KPIs from Stripe and product KPIs from PostHog and return a combined read-only digest.",
  inputSchema: reviewKpisInputSchema,
  async execute(input: unknown) {
    return reviewKpis(normalizeReviewKpisInput(input));
  }
});
