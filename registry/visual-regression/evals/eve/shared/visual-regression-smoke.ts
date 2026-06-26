export const visualRegressionSmokePrompt = [
  "Run a visual regression check on https://example.com.",
  "",
  "Goal: smoke-test the public homepage only. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials. Do not update any baseline or change the UI.",
  "First run bash setup-agent-browser.sh. Then use Agent Browser in the sandbox to open the page, inspect a snapshot, and capture one screenshot under reports/visual-regression/current/example-home.png. Compare it against reports/visual-regression/baseline if a baseline exists; otherwise note that this run establishes a baseline.",
  "Return a concise Markdown report of any unintended UI diffs. If browser automation is unavailable, report that blocker clearly instead of doing a static HTML or SEO audit."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Screens Checked/i,
  /Findings/i,
  /Screenshots?\s*\/?\s*Artifacts?/i,
  /Recommended Fixes/i,
  /Follow[- ]Up Test Prompt/i
] as const;

export const agentBrowserCommandPattern = /agent-browser/;
