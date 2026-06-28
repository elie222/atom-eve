// Shared trigger prompt text for this project's feedback sweep agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const weeklySweepPrompt =
  "Review this week's recent GitHub issues, then for each correction or complaint sweep the project for related spots that likely share the same root cause. Present a prioritized, project-wide audit of places to fix, citing the issue that motivates each one. Do not edit code, close issues, or comment automatically.";
