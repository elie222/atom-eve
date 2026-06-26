import { defineTool } from "eve/tools";
import {
  normalizeReviewExperimentsInput,
  reviewExperiments,
  reviewExperimentsInputSchema
} from "../lib/posthog.js";

export default defineTool({
  description: "Review PostHog A/B experiments, check significance, and return read-only recommendations.",
  inputSchema: reviewExperimentsInputSchema,
  async execute(input: unknown) {
    return reviewExperiments(normalizeReviewExperimentsInput(input));
  }
});
