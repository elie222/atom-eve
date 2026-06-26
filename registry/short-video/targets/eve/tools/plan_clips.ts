import { defineTool } from "eve/tools";
import {
  planClips,
  normalizePlanClipsInput,
  planClipsInputSchema
} from "../lib/fal.js";

export default defineTool({
  description: "Plan short vertical clips from a transcript or topic and return draft hooks, captions, and rationale. Network-free: does not call fal or render media.",
  inputSchema: planClipsInputSchema,
  async execute(input: unknown) {
    return planClips(normalizePlanClipsInput(input));
  }
});
