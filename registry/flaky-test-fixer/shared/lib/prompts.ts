// Shared prompt text for this project's flaky test fixer agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const flakyTestFixerInstructions =
  "Review recent GitHub Actions CI runs, surface repeatedly-failing or retried tests, and diagnose likely flakes. Stay read-only: never re-run jobs, push commits, or open pull requests or issues.";

export const weeklyReviewPrompt =
  "Run the weekly CI flake review: read recent GitHub Actions runs, classify each workflow as a likely flake, likely break, or healthy, and present read-only diagnoses and fix plans for operator approval. Do not re-run jobs or change any code or CI configuration.";
