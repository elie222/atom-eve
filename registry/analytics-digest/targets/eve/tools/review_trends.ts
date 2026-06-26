import { defineTool } from "eve/tools";
import { normalizeReviewTrendsInput, reviewTrends, reviewTrendsInputSchema } from "../lib/posthog.js";

export default defineTool({
  description: "Review this project's PostHog event trends for the last week and return a draft-ready digest summary.",
  inputSchema: reviewTrendsInputSchema,
  async execute(input: unknown) {
    return reviewTrends(normalizeReviewTrendsInput(input));
  }
});
