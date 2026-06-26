export const codeReviewerSmokePrompt = [
  "Review our open GitHub pull requests and draft review notes.",
  "",
  "Goal: list the open pull requests, read each one's changed files, then present draft review notes flagging correctness and simplification issues.",
  "Use the pull request review tool to read PR data only. Present findings as draft notes with a severity per item. Do not post comments, approve, request changes, or merge any pull request."
].join("\n");

export const requiredReplyPatterns = [
  /pull request/i,
  /correctness/i,
  /simplif/i
] as const;

export const expectedReplyToken = /draft/i;
