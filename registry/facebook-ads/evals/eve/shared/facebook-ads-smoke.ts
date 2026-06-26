export const facebookAdsSmokePrompt = [
  "Review yesterday's Facebook Ads campaign performance and recommend daily actions.",
  "",
  "Goal: inspect recent campaign insights, flag material spend or CPA movement, and recommend concrete, conservative next actions for operator approval.",
  "Use the review_campaigns tool to read campaign insights only. Report the recommendations per campaign. Do not change campaigns, budgets, targeting, or creative."
].join("\n");

export const requiredReplyPatterns = [
  /campaign/i,
  /cpa|spend/i,
  /recommend/i
] as const;

export const expectedReplyToken = /Facebook/i;
