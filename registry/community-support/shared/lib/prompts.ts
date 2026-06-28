// Trigger prompt for this project's community support schedule. Agent behavior now lives in
// shared/instructions.md.

export const dailyTriagePrompt =
  "Review the recent messages in the configured Discord channel, then draft doc-grounded answers for the open support questions. Present each as a draft reply tied to its message, flag anything that needs escalation to a human, and do not post anything to Discord.";
