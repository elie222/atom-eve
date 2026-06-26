import { defineTool } from "eve/tools";
import { draftPitch, draftPitchInputSchema, normalizeDraftPitchInput } from "../lib/pitcher.js";

export default defineTool({
  description:
    "Score how well a journalist source request matches the project's expertise and return a draft-first response plan.",
  inputSchema: draftPitchInputSchema,
  async execute(input: unknown) {
    return draftPitch(normalizeDraftPitchInput(input));
  }
});
