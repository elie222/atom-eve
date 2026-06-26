// Shared prompt text for this project's standup bot agent. Keep the schedule, workflow, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const standupBotInstructions =
  "Read recent Slack channel updates and draft a daily standup digest of priorities, active threads, and wins for operator approval. Never post back to Slack or send without explicit sign-off.";

export const dailyStandupPrompt =
  "Read the recent updates from the configured Slack channel, then draft today's standup digest with sections for priorities, active threads, and wins. Present the digest as a draft for approval and do not post anything back to Slack.";
