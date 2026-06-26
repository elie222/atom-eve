import { reviewRecentIssues } from "../../lib/agents/feedback-sweep/github.js";

export async function reviewIssues() {
  return reviewRecentIssues();
}
