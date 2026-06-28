import { defineTool } from "eve/tools";
import {
  planIncidentComms,
  normalizeDraftIncidentUpdateInput,
  draftIncidentUpdateInputSchema
} from "../lib/statuscomms.js";

export default defineTool({
  description:
    "Scaffold a customer-facing incident status update and a post-mortem outline from incident details, returned as a read-only draft plan.",
  inputSchema: draftIncidentUpdateInputSchema,
  async execute(input: unknown) {
    return planIncidentComms(normalizeDraftIncidentUpdateInput(input));
  }
});
