import { defineTool } from "eve/tools";
import {
  normalizeReviewConversationsInput,
  reviewConversations,
  reviewConversationsInputSchema
} from "../lib/intercom.js";

export default defineTool({
  description: "Review open Intercom conversations and return draft-ready reply plans for operator approval.",
  inputSchema: reviewConversationsInputSchema,
  async execute(input: unknown) {
    return reviewConversations(normalizeReviewConversationsInput(input));
  }
});
