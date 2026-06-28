// Shared trigger prompt text for this project's link building agent. Keep schedules and workflows
// thin by importing these constants instead of inlining copies. The agent's behavior summary lives
// in shared/instructions.md.

export const weeklyLinkBuildingPrompt =
  "Plan this week's link building for the project's focus topic. Use the prospecting tool to generate qualified prospect types and draft outreach, then use the programmatic SEO skill to personalize each draft. Present every message as a draft for operator approval, and flag that the prospects are categories to research rather than verified live contacts. Do not claim anything was sent.";
