import { reviewOpenPullRequests } from "../../lib/agents/code-reviewer/github.js";

export async function reviewPullRequests() {
  return reviewOpenPullRequests();
}
