// Shared prompt text for this project's error triage agent. Keep schedules,
// workflows, and agent-facing trigger text in sync from this file.

export const dailyErrorTriagePrompt =
  "Run the read-only error triage review for recent production Sentry errors and summarize severity, likely owners/files, regressions, and TDD fix plans.";
