import { defineTool } from "eve/tools";
import { generateCreative, generateCreativeInputSchema, normalizeGenerateCreativeInput } from "../lib/fal.js";

export default defineTool({
  description: "Generate ad and social image creative variants from a brief and return draft image URLs for operator approval.",
  inputSchema: generateCreativeInputSchema,
  async execute(input: unknown) {
    return generateCreative(normalizeGenerateCreativeInput(input));
  }
});
