// Shared prompt text for this project's onboarding coach agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const onboardingCoachInstructions =
  "Review PostHog activation funnel data to find users stuck before activation and draft the right nudge for each onboarding step. Never send messages or change anything; present drafts for operator approval.";

export const dailyNudgePrompt =
  "Review the PostHog activation funnel, identify the onboarding steps where users are dropping off before activation, then draft a nudge for each high drop-off step. Present each draft with the step it targets and the trigger condition for approval, and do not send anything automatically.";
