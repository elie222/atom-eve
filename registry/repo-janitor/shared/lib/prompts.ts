// Shared prompt text for this project's repo janitor agent. Keep the schedule, workflow, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const repoJanitorInstructions =
  "Plan proven low-risk repository cleanups one at a time (stale files, dead code, lint debt) and leave uncertain work alone. Read-only and draft-first: never delete, commit, or claim anything was fixed.";

export const weeklyCleanupPrompt =
  "Plan this week's repository cleanup. Use the plan_cleanup tool to classify the project's files into proven low-risk cleanups versus uncertain work to leave alone, then draft each proposed cleanup one at a time with its rationale and verification step. Do not delete files, commit, or claim anything was fixed; present every cleanup as a draft for operator approval.";
