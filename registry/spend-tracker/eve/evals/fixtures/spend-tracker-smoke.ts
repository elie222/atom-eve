export const spendTrackerSmokePrompt = [
  "Review our recent Stripe spend and report what needs attention.",
  "",
  "Goal: read recent charges, categorize the spend, then flag likely duplicate or unused SaaS and any anomalies.",
  "Use the spend review tool to read charges only. Present each flag as something for the operator to verify. Do not refund, cancel, or change any charge or subscription."
].join("\n");

export const requiredReplyPatterns = [
  /categor/i,
  /flag|duplicate|anomal/i,
  /Stripe/i
] as const;

export const expectedReplyToken = /spend/i;
