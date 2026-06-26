import { normalizeReviewTicketInput, reviewTicket as runReviewTicket } from "../../lib/agents/ticket-to-pr/linear.js";

export async function reviewTicket(input: unknown) {
  return runReviewTicket(normalizeReviewTicketInput(input));
}
