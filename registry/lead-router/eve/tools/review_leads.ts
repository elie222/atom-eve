import { defineTool } from "eve/tools";
import {
  normalizeReviewNewLeadsInput,
  reviewNewLeads,
  reviewNewLeadsInputSchema
} from "../lib/hubspot.js";

export default defineTool({
  description: "Read recent inbound HubSpot contacts and return ICP/intent scores with drafted owner assignment and first-touch outreach. Read-only.",
  inputSchema: reviewNewLeadsInputSchema,
  async execute(input: unknown) {
    return reviewNewLeads(normalizeReviewNewLeadsInput(input));
  }
});
