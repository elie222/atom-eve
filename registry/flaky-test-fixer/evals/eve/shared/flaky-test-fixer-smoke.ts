export const flakyTestFixerSmokePrompt = [
  "Review our recent GitHub Actions CI runs and tell me which tests look flaky.",
  "",
  "Goal: read recent workflow runs, group them by workflow, and classify each as a likely flake, likely break, or healthy.",
  "Use the CI runs review tool to read run history only. Present each suspect workflow with its evidence and a read-only fix plan for operator approval. Do not re-run jobs, push commits, or open pull requests or issues."
].join("\n");

export const requiredReplyPatterns = [
  /flak/i,
  /workflow/i,
  /fix plan/i
] as const;

export const expectedReplyToken = /CI|GitHub Actions/i;
