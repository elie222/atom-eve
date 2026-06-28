export const weeklyReviewPrompt =
  "Run the weekly CI flake review: read recent GitHub Actions runs, classify each workflow as a likely flake, likely break, or healthy, and present read-only diagnoses and fix plans for operator approval. Do not re-run jobs or change any code or CI configuration.";
