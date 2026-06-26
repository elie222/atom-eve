// Shared prompt text for this project's analytics digest agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const analyticsDigestInstructions =
  "Pull key event trends from PostHog and write a plain-language weekly digest for operators. Read-only: never claim to change tracking, dashboards, or PostHog configuration.";

export const weeklyDigestPrompt =
  "Review this project's PostHog event trends for the last week, then write a plain-language weekly digest. Lead with the headline movement, call out events that rose or fell materially, and flag anything worth investigating. Present it as a read-only summary; do not claim to have changed any tracking or configuration.";
