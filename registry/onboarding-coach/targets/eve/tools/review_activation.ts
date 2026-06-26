import { defineTool } from "eve/tools";
import {
  normalizeReviewActivationInput,
  reviewActivation,
  reviewActivationInputSchema
} from "../lib/posthog.js";

export default defineTool({
  description: "Review the PostHog activation funnel and return per-step drop-off with draft nudge guidance.",
  inputSchema: reviewActivationInputSchema,
  async execute(input: unknown) {
    return reviewActivation(normalizeReviewActivationInput(input));
  }
});
