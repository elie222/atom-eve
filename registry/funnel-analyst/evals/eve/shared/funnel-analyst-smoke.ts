export const funnelAnalystSmokePrompt = [
  "Review our PostHog signup funnel for the past week.",
  "",
  "Goal: build the funnel, find the biggest drop-off, and summarize retention, then recommend where to focus.",
  "Use the review_funnels tool to read funnel and retention data only. Report the biggest drop-off step and a recommendation. Do not modify any PostHog configuration."
].join("\n");

export const requiredReplyPatterns = [
  /funnel/i,
  /drop-?off/i,
  /recommend/i
] as const;

export const expectedReplyToken = /PostHog/i;
