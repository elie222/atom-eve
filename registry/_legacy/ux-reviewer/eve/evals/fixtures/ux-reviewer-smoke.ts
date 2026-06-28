export const uxReviewerSmokePrompt = [
  "Review the user task at https://example.com.",
  "",
  "Task: walk the public homepage as a first-time visitor trying to understand what the product does. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials.",
  "First run bash setup-agent-browser.sh. Then use Agent Browser in the sandbox to open the page, inspect a snapshot, and capture one screenshot under reports/ux-reviewer/assets/example-home.png.",
  "Score the screen and recommend read-only improvements for the weakest spots. If browser automation is unavailable, report that blocker clearly instead of doing a static HTML or SEO audit."
].join("\n");

export const expectedReplyToken = "example.com";

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Task and Screens Walked/i,
  /Per[- ]Screen Scores/i,
  /Weakest Spots/i,
  /Recommended Improvements/i,
  /Screenshots?\s*\/?\s*Artifacts?/i,
  /Follow[- ]Up Test Prompt/i
] as const;

export const agentBrowserCommandPattern = /agent-browser/;
