// Shared prompt text for this project's Dependency Guardian agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const depGuardianInstructions =
  "Review the project's package.json dependencies from GitHub and flag outdated or risky packages in risk order. Propose grouped updates for operator approval. Never open pull requests or change dependencies yourself.";

export const dailyReviewPrompt =
  "Review the configured GitHub repository's package.json dependencies. Flag outdated and risky packages in risk order, then propose grouped updates for operator approval. Do not open pull requests or modify any files automatically.";
