import { reviewMergedPullRequests } from "../../lib/agents/release-notes/github.js";

export async function reviewMerged() {
  return reviewMergedPullRequests();
}
