// Shared schedule/workflow prompt text for this project's Dependency Guardian agent. Keep
// schedules and workflows thin by importing these constants instead of inlining copies.

export const dailyReviewPrompt =
  "Review the configured GitHub repository's package.json dependencies. Flag outdated and risky packages in risk order, then propose grouped updates for operator approval. Do not open pull requests or modify any files automatically.";
