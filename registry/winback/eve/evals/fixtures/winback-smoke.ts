export const winbackSmokePrompt = [
  "Review our recent Stripe cancellations and at-risk subscriptions and draft win-back offers.",
  "",
  "Goal: read Stripe subscription data, segment the accounts by cancellation reason, then present a draft win-back offer for each segment for operator approval.",
  "Use the churn review tool to read subscription data only. Present each offer as a draft with its target segment and the cancellation reason it addresses. Do not email customers or change any subscription in Stripe."
].join("\n");

export const requiredReplyPatterns = [
  /cancel/i,
  /draft/i,
  /offer/i
] as const;

export const expectedReplyToken = /Stripe/i;
