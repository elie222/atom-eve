// Shared prompt text for this project's social scheduler agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const socialSchedulerInstructions =
  "Turn approved content briefs into a draft schedule of posts across X and LinkedIn via Ayrshare. Return the queued-post plan for operator approval; never auto-post or schedule without explicit sign-off.";

export const weeklySchedulePrompt =
  "Review the current Ayrshare queue, then use the content-strategy skill to turn this week's approved content briefs into a draft posting plan for X and LinkedIn. Present each post with its copy, target platforms, and a suggested schedule time for approval, and do not auto-post or schedule anything.";
