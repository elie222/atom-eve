import { planRestoreCheck } from "../../lib/agents/backup-verifier/backup.js";

export async function draftRestoreCheck() {
  return planRestoreCheck();
}
