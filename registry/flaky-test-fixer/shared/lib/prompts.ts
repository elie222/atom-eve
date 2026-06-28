// Shared trigger prompt text for this project's flaky test fixer agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const weeklyReviewPrompt =
  "Run the weekly CI flake review: read recent GitHub Actions runs, classify each workflow as a likely flake, likely break, or healthy, and present read-only diagnoses and fix plans for operator approval. Do not re-run jobs or change any code or CI configuration.";
