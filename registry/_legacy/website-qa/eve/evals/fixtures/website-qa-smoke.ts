export const websiteQaSmokePrompt = [
  "Test https://example.com.",
  "",
  "Goal: smoke-test the public homepage only. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials.",
  "First run bash setup-agent-browser.sh. Then use Agent Browser in the sandbox to open the page, inspect a snapshot, and capture one screenshot under reports/assets/example-home.png.",
  "Return a concise Markdown QA report. If browser automation is unavailable, report that blocker clearly instead of doing a static HTML or SEO audit."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /What Was Checked/i,
  /Findings/i,
  /Screenshots?\s*\/?\s*Artifacts?/i,
  /Recommended Fixes/i,
  /Follow[- ]Up Test Prompt/i
] as const;

export const agentBrowserCommandPattern = /agent-browser/;
