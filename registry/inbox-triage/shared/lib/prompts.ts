// Shared trigger prompt text for this project's inbox triage agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const dailyTriagePrompt =
  "Review the Gmail inbox with the review_inbox tool, then produce today's Inbox Zero triage. Group messages into noise to label or archive and messages that need a reply, and write a ready-to-send draft reply for each of the latter. Present every label, archive, and reply as a draft for operator approval, and do not change the inbox or send anything automatically.";
