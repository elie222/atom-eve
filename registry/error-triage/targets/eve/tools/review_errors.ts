import { defineTool } from "eve/tools";
import {
  reviewSentryErrors,
  reviewSentryErrorsInputSchema,
  type ReviewSentryErrorsInput,
} from "../lib/sentry.js";

export default defineTool({
  description: "Review recent production Sentry errors without mutating issues or creating pull requests.",
  inputSchema: reviewSentryErrorsInputSchema,
  async execute(input: ReviewSentryErrorsInput) {
    return reviewSentryErrors(input);
  }
});
