export const onboardingTesterSmokePrompt = [
  "Run the onboarding test as a first-time developer for a sample project.",
  "",
  "Clean checkout: git clone https://github.com/octocat/Hello-World && cd Hello-World",
  "Follow the README literally, in order, from this clean checkout. The docs claim the app should load locally.",
  "First run bash setup-agent-browser.sh. Then use native sandbox commands to follow the documented setup and the native browser to verify the app loads.",
  "Stop at the first blocker, confirm it by retrying from a clean checkout, and report the exact doc/script fix needed. Do not change any project files.",
  "Return a concise Markdown report. If sandbox commands or browser automation are unavailable, report that blocker clearly."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Setup Steps Followed/i,
  /First Blocker/i,
  /Recommended Doc\/?Script Fix/i,
  /Clean Re-?run Result/i,
  /Evidence (and|&) Artifacts/i,
  /Remaining Risks (and|&) Follow[- ]up/i
] as const;

export const cleanSetupCommandPattern = /git|setup-agent-browser|npm|agent-browser/;

export const blockerToken = /blocker/i;
