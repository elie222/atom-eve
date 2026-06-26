// Shared prompt text for this project's feedback sweep agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const feedbackSweepInstructions =
  "Review recent GitHub issues as user corrections and complaints, then audit this project for every related spot that should be fixed. Read-only: propose fixes for operator review, never edit code or change issues.";

export const weeklySweepPrompt =
  "Review this week's recent GitHub issues, then for each correction or complaint sweep the project for related spots that likely share the same root cause. Present a prioritized, project-wide audit of places to fix, citing the issue that motivates each one. Do not edit code, close issues, or comment automatically.";
