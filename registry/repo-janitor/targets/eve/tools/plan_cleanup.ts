import { defineTool } from "eve/tools";
import {
  planRepoCleanup,
  normalizePlanRepoCleanupInput,
  planRepoCleanupInputSchema
} from "../lib/janitor.js";

export default defineTool({
  description: "Classify repository files into proven low-risk cleanups versus uncertain work and return a read-only, draft-first cleanup plan.",
  inputSchema: planRepoCleanupInputSchema,
  async execute(input: unknown) {
    return planRepoCleanup(normalizePlanRepoCleanupInput(input));
  }
});
