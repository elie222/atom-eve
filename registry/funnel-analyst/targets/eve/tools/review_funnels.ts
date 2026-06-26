import { defineTool } from "eve/tools";
import {
  normalizeReviewFunnelsInput,
  reviewFunnels,
  reviewFunnelsInputSchema
} from "../lib/posthog.js";

export default defineTool({
  description:
    "Build a PostHog funnel and retention view, find the biggest drop-off, and return read-only recommendations.",
  inputSchema: reviewFunnelsInputSchema,
  async execute(input: unknown) {
    return reviewFunnels(normalizeReviewFunnelsInput(input));
  }
});
