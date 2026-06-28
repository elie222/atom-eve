export const recruiterSmokePrompt = [
  "Review our latest Ashby applicants for the Senior Backend Engineer role.",
  "",
  "Goal: read the recent applicants, score them against the role, and present a ranked shortlist with a short rationale per candidate, then draft outreach for operator approval.",
  "Use the review applicants tool to read candidate data only. Present the shortlist and outreach as drafts. Do not move candidates between stages, change their status, or send messages in Ashby."
].join("\n");

export const requiredReplyPatterns = [
  /shortlist/i,
  /draft/i,
  /role/i
] as const;

export const expectedReplyToken = /Ashby/i;
