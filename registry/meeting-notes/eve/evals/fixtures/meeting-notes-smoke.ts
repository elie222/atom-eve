export const meetingNotesSmokePrompt = [
  "Summarize our latest Fireflies meeting transcript.",
  "",
  "Goal: read the most recent transcript, then present meeting notes, key decisions, and action items.",
  "Use the review_transcript tool to read transcript data only. List action items with owners, and propose follow-ups as drafts for operator approval. Do not send emails, create tasks, or post to Slack."
].join("\n");

export const requiredReplyPatterns = [
  /decision/i,
  /action item/i,
  /draft/i
] as const;

export const expectedReplyToken = /transcript/i;
