export const backupVerifierSmokePrompt = [
  "Draft a clean-room restore-and-verify plan for our backups.",
  "",
  "Backup setup: nightly Postgres dumps stored in the same cloud account as production, kept for 7 days.",
  "Use the plan_restore_check tool to draft the clean-room restore-and-verify steps for the required recovery scenarios and report any gaps in backup coverage.",
  "Present everything as a read-only plan for operator review. Do not restore, delete, or modify anything."
].join("\n");

export const expectedReplyPattern = /clean[- ]?room/i;
