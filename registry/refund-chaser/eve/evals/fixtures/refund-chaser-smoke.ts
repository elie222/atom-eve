export const refundChaserSmokePrompt = [
  "Review our open Stripe refunds and disputes and draft the next follow-up for each.",
  "",
  "Goal: read the open refunds and disputes, then draft a follow-up for each unresolved item for operator approval.",
  "Use the refund review tool to read Stripe data only. Present each follow-up as a draft. Do not issue refunds or submit dispute evidence."
].join("\n");

export const requiredReplyPatterns = [
  /refund/i,
  /dispute/i,
  /draft/i
] as const;

export const expectedReplyToken = /Stripe/i;
