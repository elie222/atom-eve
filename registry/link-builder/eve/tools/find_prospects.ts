import { defineTool } from "eve/tools";
import { findProspects, findProspectsInputSchema, normalizeFindProspectsInput } from "../lib/linkbuilder.js";

export default defineTool({
  description: "Plan backlink and guest-post prospects for a topic and return draft outreach for operator approval.",
  inputSchema: findProspectsInputSchema,
  async execute(input: unknown) {
    return findProspects(normalizeFindProspectsInput(input));
  }
});
