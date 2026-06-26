export const errorCopySmokePrompt = [
  "Review the error copy on https://example.com.",
  "",
  "Goal: find user-facing error messages, confirm which states are reachable, and draft clearer, more empathetic rewrites for operator approval.",
  "Use the native browser in the sandbox to open the page, trigger reachable error states such as form validation or a 404, capture screenshots under reports/error-copy/artifacts, and record the exact current copy.",
  "Do not sign up, submit payment, bypass CAPTCHA, use real credentials, or change anything. Present rewrites as before/after drafts only.",
  "Return a concise Markdown report. If browser automation is unavailable, report that blocker clearly instead of doing a static HTML audit."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Pages and Flows Crawled/i,
  /Error Messages Found/i,
  /Reachable\s*(?:vs\.?|versus)\s*Unverified/i,
  /Rewrite Drafts/i,
  /Recommended Actions/i
] as const;

export const expectedReplyToken = /error/i;
