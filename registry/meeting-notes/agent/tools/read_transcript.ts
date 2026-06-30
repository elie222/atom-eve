import { defineTool } from "eve/tools";
import { normalizeReadTranscriptInput, readTranscript, readTranscriptInputSchema } from "../lib/fireflies.js";

export default defineTool({
  description: "Read a Fireflies transcript, including metadata, summary fields, speakers, attendees, and transcript sentences.",
  inputSchema: readTranscriptInputSchema,
  async execute(input: unknown) {
    return readTranscript(normalizeReadTranscriptInput(input));
  },
});
