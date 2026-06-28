export const funnelAnalystSmokePrompt = [
  "Review our PostHog signup funnel for the past week.",
  "",
  "Goal: build the funnel, find the biggest drop-off, and summarize retention, then recommend where to focus.",
  "First run bash setup-posthog-cli.sh. Then use posthog-cli in the sandbox: discover tools with posthog-cli api search/tools, run posthog-cli api info before any call, confirm events with read-data-schema, then read funnel and retention data. Read-only: do not modify any PostHog configuration and do not use destructive --confirm tools.",
  "If the PostHog CLI is unavailable or auth is missing, report that blocker clearly instead of inventing funnel numbers."
].join("\n");

export const requiredReplyPatterns = [
  /funnel/i,
  /drop-?off/i,
  /recommend/i
] as const;

export const expectedReplyToken = /PostHog/i;

export const posthogCliCommandPattern = /posthog-cli/;
