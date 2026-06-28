import { defineTool } from "eve/tools";
import {
  normalizeReviewTranscriptInput,
  reviewTranscript,
  reviewTranscriptInputSchema
} from "../lib/fireflies.js";

export default defineTool({
  description: "Read a Fireflies meeting transcript and return a draft-ready summary, decisions, and action items.",
  inputSchema: reviewTranscriptInputSchema,
  async execute(input: unknown) {
    return reviewTranscript(normalizeReviewTranscriptInput(input));
  }
});
