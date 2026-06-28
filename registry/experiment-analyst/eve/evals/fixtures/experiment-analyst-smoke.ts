export const experimentAnalystSmokePrompt = [
  "Review our PostHog A/B experiments and summarize the results.",
  "",
  "Goal: read the experiments, check statistical significance, and name a winning variant only where the data supports it.",
  "First run bash setup-posthog-cli.sh. Then use posthog-cli in the sandbox following the discover/info/call workflow (`posthog-cli api search experiment`, `posthog-cli api info <tool>`, `posthog-cli api call <tool>`) to read experiment data only. For each experiment report its status, whether it reached significance, the winner if there is a clear one, and the key learning. Stay read-only: do not roll out variants or change feature flags. If the CLI or auth is unavailable, report that blocker clearly."
].join("\n");

export const requiredReplyPatterns = [
  /significan/i,
  /winner|variant/i,
  /learning|takeaway/i
] as const;

export const expectedReplyToken = /experiment/i;

export const posthogCliCommandPattern = /posthog-cli/;
