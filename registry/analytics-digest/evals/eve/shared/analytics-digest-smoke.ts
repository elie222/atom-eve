export const analyticsDigestSmokePrompt = [
  "Review our PostHog event trends for the last week and write the weekly digest.",
  "",
  "Goal: read event trends only, then write a plain-language weekly digest for the team.",
  "First run bash setup-posthog-cli.sh. Then use posthog-cli in the sandbox to read PostHog data: discover a tool with `posthog-cli api search`, inspect it with `posthog-cli api info`, then `posthog-cli api call`. Lead with the headline movement and flag anything worth investigating. Do not claim to have changed tracking, dashboards, or any PostHog configuration. If the CLI is unavailable, report that blocker clearly instead of inventing numbers."
].join("\n");

export const expectedReplyToken = /PostHog/i;

export const posthogCliCommandPattern = /posthog-cli/;
