export const adversarialReviewerSmokePrompt = [
  "Give me an adversarial second-opinion review of pull request #1.",
  "",
  "Goal: read the pull request and its diff, then surface the highest-impact objections first, separating blocking concerns from nits.",
  "Use the review tool to read the PR and diff only. This is a read-only second opinion: do not approve, merge, request changes, comment, or claim any change was made."
].join("\n");

export const requiredReplyPatterns = [
  /objection|concern|risk/i,
  /blocking|nit/i,
  /pull request|PR/i
] as const;

export const expectedReplyToken = /review/i;
