// Shared trigger prompt text for this project's PostHog funnel analyst agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const weeklyFunnelPrompt =
  "Review this project's PostHog funnels and retention for the past week using posthog-cli in the sandbox. Discover the right tools (search/info), confirm events with read-data-schema, then build the funnel and retention/cohort views, identify the biggest drop-off and the retention trend, and recommend where to focus. Read-only: do not modify any PostHog configuration.";
