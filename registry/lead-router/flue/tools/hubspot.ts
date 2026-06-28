import { reviewNewLeads } from "../../lib/agents/lead-router/hubspot.js";

export async function reviewLeads() {
  return reviewNewLeads();
}
