// Shared schedule/workflow prompt text for this project's Stripe dunning agent. Keep the
// schedule and workflow thin by importing these constants instead of inlining copies.

export const dailyLoopPrompt =
  "Run the Stripe dunning review: read recent failed charges and expiring cards, then present the staged recovery email drafts and recommendations for operator approval. Do not charge cards or send any email.";
