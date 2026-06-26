export const onboardingCoachSmokePrompt = [
  "Review our PostHog activation funnel and draft nudges for users stuck before activation.",
  "",
  "Goal: read the activation funnel, find the onboarding steps with the worst drop-off, then present a draft nudge per step for operator approval.",
  "First run bash setup-posthog-cli.sh. Then use posthog-cli api in the sandbox following the discover -> info -> call workflow (search/tools, then info <tool>, then call <tool>) to read funnel data only. Present each nudge as a draft with the step it targets and the trigger condition. Stay read-only: do not send messages or mutate anything in PostHog. If posthog-cli is unavailable, report that blocker clearly instead of inventing funnel numbers."
].join("\n");

export const requiredReplyPatterns = [
  /activation/i,
  /draft/i,
  /step/i
] as const;

export const expectedReplyToken = /PostHog/i;

export const posthogCliCommandPattern = /posthog-cli/;
