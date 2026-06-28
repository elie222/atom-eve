import { improveCopy as buildCopyPlan, normalizeImproveCopyInput } from "../../lib/agents/microcopy/microcopy.js";

export async function improveCopy(input?: unknown) {
  return buildCopyPlan(normalizeImproveCopyInput(input));
}
