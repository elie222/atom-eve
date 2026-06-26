import { findProspects, normalizeFindProspectsInput } from "../../lib/agents/link-builder/linkbuilder.js";

export async function findProspectsTool(input: unknown) {
  return findProspects(normalizeFindProspectsInput(input));
}
