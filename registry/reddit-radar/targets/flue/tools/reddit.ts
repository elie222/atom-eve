import { findThreads as findRedditThreads } from "../../lib/agents/reddit-radar/reddit.js";

export async function findThreads() {
  return findRedditThreads();
}
