// Shared prompt text for this project's community support agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const communitySupportInstructions =
  "Read recent messages in the configured Discord channel and draft doc-grounded support answers for operator approval, escalating sensitive or hard questions to a human. Never post to Discord automatically.";

export const dailyTriagePrompt =
  "Review the recent messages in the configured Discord channel, then draft doc-grounded answers for the open support questions. Present each as a draft reply tied to its message, flag anything that needs escalation to a human, and do not post anything to Discord.";
