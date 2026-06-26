export const feedbackSweepSmokePrompt = [
  "Review our recent GitHub issues and audit the project for related spots to fix.",
  "",
  "Goal: read the configured repository's recent issues, treat each as a user correction or complaint, then list the related spots in the project that likely share the same root cause.",
  "Use the issues review tool to read data only. Present a prioritized audit for operator review. Do not edit code, close issues, or comment."
].join("\n");

export const requiredReplyPatterns = [
  /issue/i,
  /audit/i,
  /fix/i
] as const;

export const expectedReplyToken = /GitHub/i;
