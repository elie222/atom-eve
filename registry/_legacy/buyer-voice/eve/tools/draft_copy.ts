import { defineTool } from "eve/tools";
import { draftCopy, draftCopyInputSchema, normalizeDraftCopyInput } from "../lib/voice.js";

export default defineTool({
  description:
    "Cluster buyer objections from provided notes by theme and return draft-ready landing-page copy scaffolds for each theme.",
  inputSchema: draftCopyInputSchema,
  async execute(input: unknown) {
    return draftCopy(normalizeDraftCopyInput(input));
  }
});
