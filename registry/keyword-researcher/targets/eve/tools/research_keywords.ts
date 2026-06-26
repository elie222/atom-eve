import { defineTool } from "eve/tools";
import {
  normalizeResearchKeywordsInput,
  researchKeywords,
  researchKeywordsInputSchema
} from "../lib/dataforseo.js";

export default defineTool({
  description: "Research keyword ideas for the given seeds and return volume, difficulty, and intent clusters.",
  inputSchema: researchKeywordsInputSchema,
  async execute(input: unknown) {
    return researchKeywords(normalizeResearchKeywordsInput(input));
  }
});
