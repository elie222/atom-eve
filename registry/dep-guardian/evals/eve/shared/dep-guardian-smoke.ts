export const depGuardianSmokePrompt = [
  "Review our GitHub repository's dependencies and tell us what to update.",
  "",
  "Goal: read package.json from the configured repo, flag outdated and risky dependencies in risk order, then propose grouped updates for operator approval.",
  "Use the dependency review tool to read the manifest only. Present findings in risk order with a reason for each. Do not open pull requests or change package.json."
].join("\n");

export const requiredReplyPatterns = [
  /dependenc/i,
  /risk/i,
  /update/i
] as const;

export const expectedReplyToken = /package\.json/i;
