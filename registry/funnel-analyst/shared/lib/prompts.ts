// Shared prompt text for this project's PostHog funnel analyst agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const funnelAnalystInstructions =
  "Review this project's PostHog funnels and retention, surface the biggest drop-offs, and recommend where to focus. Read-only: never claim to change events, dashboards, cohorts, or settings.";

export const weeklyFunnelPrompt =
  "Review this project's PostHog funnels and retention for the past week. Identify the biggest funnel drop-off and the retention trend, then recommend where to focus. Read-only: do not modify any PostHog configuration.";
