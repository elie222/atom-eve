export const googleAdsSmokePrompt = [
  "Review recent Google Ads campaign performance for the configured account.",
  "",
  "Use the review_campaigns tool to fetch yesterday's campaign metrics compared with the previous day.",
  "Return a concise summary of spend and CPA movement, plus conservative budget, keyword, and negative-keyword recommendations for operator approval.",
  "Do not claim to have changed any campaigns, budgets, or keywords."
].join("\n");

export const expectedReplyPattern = /recommend/i;
