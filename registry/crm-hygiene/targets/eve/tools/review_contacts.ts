import { defineTool } from "eve/tools";
import {
  normalizeReviewContactsInput,
  reviewContacts,
  reviewContactsInputSchema
} from "../lib/hubspot.js";

export default defineTool({
  description: "Scan HubSpot contacts and return a read-only cleanup report covering duplicates, missing fields, and stale records.",
  inputSchema: reviewContactsInputSchema,
  async execute(input: unknown) {
    return reviewContacts(normalizeReviewContactsInput(input));
  }
});
