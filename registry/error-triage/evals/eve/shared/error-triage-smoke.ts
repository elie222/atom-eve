export const errorTriageSmokePrompt = [
  "Triage our recent production Sentry errors and report what needs attention.",
  "",
  "Goal: review recent Sentry issues, group likely regressions, and propose read-only triage with severity, evidence, likely owner or file when inferable, and a TDD-style fix plan.",
  "Use the error review tool to read issues only. Do not mutate Sentry issues, assign owners, comment on incidents, or create pull requests. Be explicit when owner or file attribution is only inferred."
].join("\n");

export const requiredReplyPatterns = [
  /severity/i,
  /regression|triage/i,
  /Sentry/i
] as const;

export const expectedReplyToken = /error/i;
