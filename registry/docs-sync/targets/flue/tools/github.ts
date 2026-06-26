import { reviewRecentChanges } from "../../lib/agents/docs-sync/github.js";

export async function reviewChanges() {
  return reviewRecentChanges();
}
