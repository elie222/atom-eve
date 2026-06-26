export const instantlyOutreachSmokePrompt = [
  "Plan a cold-email outreach campaign for our Heads of Growth ICP.",
  "",
  "Goal: pull fresh ICP leads from Apollo, review recent Instantly campaign performance, then draft a cold-email campaign with a 3-4 step follow-up sequence.",
  "Use the review_outreach tool to read the leads and campaign analytics only. Present the lead list, the performance review, and every email as a draft for operator approval with its subject line, step, and send delay.",
  "Do not create, launch, or schedule a campaign in Instantly, and do not contact any lead."
].join("\n");

export const requiredReplyPatterns = [/sequence/i, /draft/i, /subject/i] as const;

export const expectedReplyToken = /Instantly/i;
