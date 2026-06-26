export const emailResendSmokePrompt = [
  "Review our Resend audiences and draft a lifecycle welcome email for new subscribers.",
  "",
  "Goal: read the audience data with the Resend review tool, then draft one email for operator approval.",
  "Present the email as a draft, including a subject line and the audience or segment it targets.",
  "Do not send the broadcast or claim it was sent."
].join("\n");

export const requiredDraftPatterns = [
  /audience/i,
  /subject/i,
  /draft/i
] as const;

export const expectedReplyToken = /draft/i;
