import {
  generateThumbnails as runGenerateThumbnails,
  normalizeGenerateThumbnailsInput
} from "../../lib/agents/thumbnail-studio/fal.js";

export async function generateThumbnails(input: unknown) {
  return runGenerateThumbnails(normalizeGenerateThumbnailsInput(input));
}
