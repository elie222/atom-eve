import { defineTool } from "eve/tools";
import {
  normalizeReviewSentryErrorsInput,
  reviewSentryErrors,
  reviewSentryErrorsInputSchema
} from "../lib/sentry.js";

export default defineTool({
  description: "Review recent production Sentry errors without mutating issues or creating pull requests.",
  inputSchema: reviewSentryErrorsInputSchema,
  async execute(input: unknown) {
    return reviewSentryErrors(normalizeReviewSentryErrorsInput(input));
  }
});
