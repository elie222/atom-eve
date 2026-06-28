import { reviewContacts as reviewHubSpotContacts } from "../../lib/agents/crm-hygiene/hubspot.js";

export async function reviewContacts() {
  return reviewHubSpotContacts();
}
