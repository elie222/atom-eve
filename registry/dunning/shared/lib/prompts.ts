// Shared prompt text for this project's Stripe dunning agent. Keep the schedule, workflow, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const dunningInstructions =
  "Review the project's Stripe failed charges and expiring cards, then draft a staged recovery email sequence for operator approval. Never charge a card or send email; present every email as a draft.";

export const dailyLoopPrompt =
  "Run the Stripe dunning review: read recent failed charges and expiring cards, then present the staged recovery email drafts and recommendations for operator approval. Do not charge cards or send any email.";
