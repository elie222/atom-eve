export const analyticsDigestSmokePrompt = [
  "Review our PostHog event trends for the last week and write the weekly digest.",
  "",
  "Goal: read event trends only, then write a plain-language weekly digest for the team.",
  "Use the trends review tool to read PostHog data. Lead with the headline movement and flag anything worth investigating. Do not claim to have changed tracking, dashboards, or any PostHog configuration."
].join("\n");

export const requiredReplyPatterns = [/trend/i, /week/i, /event/i] as const;

export const expectedReplyToken = /PostHog/i;
