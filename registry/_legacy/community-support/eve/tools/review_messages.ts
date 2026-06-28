import { defineTool } from "eve/tools";
import {
  normalizeReviewMessagesInput,
  reviewMessages,
  reviewMessagesInputSchema
} from "../lib/discord.js";

export default defineTool({
  description: "Read recent messages in the configured Discord channel and return a triaged, draft-ready summary.",
  inputSchema: reviewMessagesInputSchema,
  async execute(input: unknown) {
    return reviewMessages(normalizeReviewMessagesInput(input));
  }
});
