// Shared prompt text for this project's Stripe win-back agent. Keep schedules and workflows thin
// by importing these constants instead of inlining copies. The agent's behavior now lives in
// shared/instructions.md.

export const weeklyWinbackPrompt =
  "Review recent Stripe cancellations and at-risk subscriptions with the churn review tool. Segment the accounts by cancellation reason, then draft a win-back offer for each segment. Present every offer as a draft for operator approval and do not send anything or change any subscription automatically.";
