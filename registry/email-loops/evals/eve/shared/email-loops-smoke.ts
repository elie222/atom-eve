export const emailLoopsSmokePrompt = [
  "Review our Loops audience and draft a welcome email for new signups.",
  "",
  "Goal: read the Loops mailing lists, summarize the audience, then present a draft welcome email for operator approval.",
  "Use the Loops review tool to read audience data only. Present the email as a draft with a subject line and the list or segment it targets. Do not send broadcasts or trigger Loops events."
].join("\n");

export const requiredReplyPatterns = [
  /audience/i,
  /draft/i,
  /subject/i
] as const;

export const expectedReplyToken = /Loops/i;
