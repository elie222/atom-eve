// Shared prompt text for this project's repo janitor agent. Keep the schedule and workflow thin by
// importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const weeklyCleanupPrompt =
  "Plan this week's repository cleanup. Use the plan_cleanup tool to classify the project's files into proven low-risk cleanups versus uncertain work to leave alone, then draft each proposed cleanup one at a time with its rationale and verification step. Do not delete files, commit, or claim anything was fixed; present every cleanup as a draft for operator approval.";
