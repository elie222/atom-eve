import { defineTool } from "eve/tools";
import {
  normalizeReviewRecentTicketsInput,
  reviewRecentTickets,
  reviewRecentTicketsInputSchema
} from "../lib/intercom.js";

export default defineTool({
  description:
    "Review recent Intercom conversations, cluster recurring questions, and return draft knowledge base articles and doc-gap flags.",
  inputSchema: reviewRecentTicketsInputSchema,
  async execute(input: unknown) {
    return reviewRecentTickets(normalizeReviewRecentTicketsInput(input));
  }
});
