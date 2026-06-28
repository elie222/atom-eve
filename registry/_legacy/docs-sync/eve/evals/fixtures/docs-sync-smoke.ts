export const docsSyncSmokePrompt = [
  "Review our recent commits and merged pull requests for documentation drift.",
  "",
  "Goal: read recent commits and pull requests, flag any documentation that has likely drifted from the code, then present a proposed doc update as a draft for approval.",
  "Use the review tool to read commit and pull-request data only. Present the proposed update as a draft naming the doc file it targets. Do not open a pull request or edit any file."
].join("\n");

export const requiredReplyPatterns = [
  /documentation|docs/i,
  /draft|propose/i,
  /review/i
] as const;

export const expectedReplyToken = /documentation|docs/i;
