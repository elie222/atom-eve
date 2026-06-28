import { planRepoCleanup } from "../../lib/agents/repo-janitor/janitor.js";

export async function planCleanup() {
  return planRepoCleanup();
}
