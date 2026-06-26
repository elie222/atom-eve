// Shared prompt text for this project's inbox triage agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const inboxTriageInstructions =
  "Review this project's Gmail inbox and produce an Inbox Zero style triage: classify each message, recommend labeling or archiving the noise, and draft replies for everything that needs one. Read-only and draft-first; never label, archive, or send without explicit operator sign-off.";

export const dailyTriagePrompt =
  "Review the Gmail inbox with the review_inbox tool, then produce today's Inbox Zero triage. Group messages into noise to label or archive and messages that need a reply, and write a ready-to-send draft reply for each of the latter. Present every label, archive, and reply as a draft for operator approval, and do not change the inbox or send anything automatically.";
