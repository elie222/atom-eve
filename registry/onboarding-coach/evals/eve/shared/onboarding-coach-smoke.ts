export const onboardingCoachSmokePrompt = [
  "Review our PostHog activation funnel and draft nudges for users stuck before activation.",
  "",
  "Goal: read the activation funnel, find the onboarding steps with the worst drop-off, then present a draft nudge per step for operator approval.",
  "Use the activation review tool to read funnel data only. Present each nudge as a draft with the step it targets and the trigger condition. Do not send messages or change anything in PostHog."
].join("\n");

export const requiredReplyPatterns = [
  /activation/i,
  /draft/i,
  /step/i
] as const;

export const expectedReplyToken = /PostHog/i;
