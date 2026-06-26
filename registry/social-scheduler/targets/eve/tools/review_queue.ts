import { defineTool } from "eve/tools";
import {
  normalizeReviewAyrshareQueueInput,
  reviewAyrshareQueue,
  reviewAyrshareQueueInputSchema
} from "../lib/ayrshare.js";

export default defineTool({
  description: "Review the project's Ayrshare queue or post analytics and return a draft-ready posting summary.",
  inputSchema: reviewAyrshareQueueInputSchema,
  async execute(input: unknown) {
    return reviewAyrshareQueue(normalizeReviewAyrshareQueueInput(input));
  }
});
