import { defineTool } from "eve/tools";
import {
  generateThumbnails,
  generateThumbnailsInputSchema,
  normalizeGenerateThumbnailsInput
} from "../lib/fal.js";

export default defineTool({
  description:
    "Generate distinct thumbnail concepts for a topic with fal.ai and self-score each against a clarity and no-clickbait bar. Returns concept image URLs for operator approval; publishes nothing.",
  inputSchema: generateThumbnailsInputSchema,
  async execute(input: unknown) {
    return generateThumbnails(normalizeGenerateThumbnailsInput(input));
  }
});
