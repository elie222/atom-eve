import { defineTool } from "eve/tools";
import { normalizeReviewCiRunsInput, reviewCiRuns, reviewCiRunsInputSchema } from "../lib/github.js";

export default defineTool({
  description:
    "Review recent GitHub Actions CI runs to surface repeatedly-failing or retried tests and diagnose likely flakes. Read-only: never re-runs jobs or opens pull requests.",
  inputSchema: reviewCiRunsInputSchema,
  async execute(input: unknown) {
    return reviewCiRuns(normalizeReviewCiRunsInput(input));
  }
});
