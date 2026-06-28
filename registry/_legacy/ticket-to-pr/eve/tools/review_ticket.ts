import { defineTool } from "eve/tools";
import { normalizeReviewTicketInput, reviewTicket, reviewTicketInputSchema } from "../lib/linear.js";

export default defineTool({
  description:
    "Read a Linear ticket by id or identifier and return a draft-ready summary for planning a PR.",
  inputSchema: reviewTicketInputSchema,
  async execute(input: unknown) {
    return reviewTicket(normalizeReviewTicketInput(input));
  }
});
