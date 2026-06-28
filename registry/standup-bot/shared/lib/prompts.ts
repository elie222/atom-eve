// Shared prompt text for this project's standup bot agent. Keep the schedule and workflow thin by
// importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const dailyStandupPrompt =
  "Read the recent updates from the configured Slack channel, then draft today's standup digest with sections for priorities, active threads, and wins. Present the digest as a draft for approval and do not post anything back to Slack.";
