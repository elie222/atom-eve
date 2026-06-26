import { normalizeReviewInboxInput, reviewInbox } from "../../lib/agents/inbox-triage/gmail.js";

export async function reviewInboxTool(input: unknown) {
  return reviewInbox(normalizeReviewInboxInput(input));
}
