export const revenueDigestSmokePrompt = [
  "Run this week's revenue digest from Stripe.",
  "",
  "Goal: read Stripe subscriptions and invoices, then summarize MRR, new and churned subscriptions, and the top accounts by MRR.",
  "Use the revenue review tool to read data only. Present a digest with read-only recommendations. Do not create, update, or cancel anything in Stripe."
].join("\n");

export const requiredReplyPatterns = [
  /MRR/i,
  /churn/i,
  /top account/i
] as const;

export const expectedReplyToken = /Stripe/i;
