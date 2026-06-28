import { defineTool } from "eve/tools";
import { normalizeReviewInboxInput, reviewInbox, reviewInboxInputSchema } from "../lib/gmail.js";

export default defineTool({
  description: "Review the project's Gmail inbox and return a read-only, draft-first triage of its messages.",
  inputSchema: reviewInboxInputSchema,
  async execute(input: unknown) {
    return reviewInbox(normalizeReviewInboxInput(input));
  }
});
