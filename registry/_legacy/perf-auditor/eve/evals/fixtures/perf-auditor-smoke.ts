export const perfAuditorSmokePrompt = [
  "Audit the performance of https://example.com.",
  "",
  "Goal: measure load performance and transfer weight for the public homepage only. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials.",
  "First run bash setup-agent-browser.sh. Then drive agent-browser in the sandbox to open the page, read Navigation Timing and Resource Timing, and capture one screenshot under reports/perf-auditor/artifacts/example-home.png.",
  "Identify the single worst bottleneck and propose one behavior-preserving fix. Stay read-only; do not change or deploy the site. If browser automation is unavailable, report that blocker clearly instead of guessing the numbers."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /What Was Measured/i,
  /Performance Metrics/i,
  /Worst Bottleneck/i,
  /Proposed Fix/i,
  /Screenshots?\s*\/?\s*Artifacts?/i
] as const;

export const expectedReplyToken = /bottleneck/i;

export const agentBrowserCommandPattern = /agent-browser/;
