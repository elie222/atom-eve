import { normalizeResearchKeywordsInput, researchKeywords } from "../../lib/agents/keyword-researcher/dataforseo.js";

export async function researchKeywordsTool(input: unknown) {
  return researchKeywords(normalizeResearchKeywordsInput(input));
}
