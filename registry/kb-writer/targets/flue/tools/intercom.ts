import { reviewRecentTickets } from "../../lib/agents/kb-writer/intercom.js";

export async function reviewTickets() {
  return reviewRecentTickets();
}
