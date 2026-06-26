export const a11yAuditorSmokePrompt = [
  "Run an accessibility audit of https://example.com.",
  "",
  "Goal: audit the public homepage only. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials.",
  "First run bash setup-agent-browser.sh. Then use Agent Browser in the sandbox to open the page, inject and run axe-core, and capture one screenshot under reports/a11y-auditor/artifacts/example-home.png.",
  "Group any WCAG violations by user harm with proposed read-only fixes. Do not edit, deploy, or claim to fix anything. If browser automation is unavailable, report that blocker clearly instead of doing a static HTML or SEO audit."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Pages Audited/i,
  /Violations Grouped by User Harm/i,
  /WCAG Success Criteria/i,
  /Proposed Fixes/i,
  /Screenshots? (and|\/)? ?Artifacts?/i,
  /Recommended Actions/i
] as const;

export const agentBrowserCommandPattern = /agent-browser/;

export const expectedReplyToken = /WCAG/i;
