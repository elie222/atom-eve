export const experimentAnalystSmokePrompt = [
  "Review our PostHog A/B experiments and summarize the results.",
  "",
  "Goal: read the experiments, check statistical significance, and name a winning variant only where the data supports it.",
  "Use the review tool to read experiment data only. For each experiment report its status, whether it reached significance, the winner if there is a clear one, and the key learning. Do not roll out variants or change feature flags."
].join("\n");

export const requiredReplyPatterns = [
  /significan/i,
  /winner|variant/i,
  /learning|takeaway/i
] as const;

export const expectedReplyToken = /experiment/i;
