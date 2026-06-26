// Shared prompt text for this project's Stripe win-back agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const winbackInstructions =
  "Review recent Stripe cancellations and at-risk subscriptions, segment them by cancellation reason, and draft conservative win-back offers for operator approval. Never email customers or change subscriptions without explicit sign-off.";

export const weeklyWinbackPrompt =
  "Review recent Stripe cancellations and at-risk subscriptions with the churn review tool. Segment the accounts by cancellation reason, then draft a win-back offer for each segment. Present every offer as a draft for operator approval and do not send anything or change any subscription automatically.";
