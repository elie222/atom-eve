export const dunningSmokePrompt = [
  "Review our Stripe failed charges and expiring cards, then draft a recovery email sequence.",
  "",
  "Goal: read recent Stripe charges only, identify failed payments and cards about to expire, then present a staged recovery email sequence for operator approval.",
  "Use the Stripe review tool to read charge data only. Present each recovery email as a draft with a subject line and the stage timing. Do not charge cards, retry payments, or send any email."
].join("\n");

export const requiredReplyPatterns = [
  /recovery/i,
  /draft/i,
  /subject/i
] as const;

export const expectedReplyToken = /Stripe/i;
