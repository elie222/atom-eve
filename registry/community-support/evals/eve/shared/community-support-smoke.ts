export const communitySupportSmokePrompt = [
  "Review our recent Discord channel messages and draft support answers.",
  "",
  "Goal: read the recent messages, triage the open support questions, then present draft doc-grounded replies for operator approval.",
  "Use the review_messages tool to read channel data only. Present each answer as a draft tied to its message, escalate anything sensitive to a human, and do not post anything to Discord."
].join("\n");

export const requiredReplyPatterns = [
  /draft/i,
  /escalat/i,
  /message/i
] as const;

export const expectedReplyToken = /Discord/i;
