export const seoAuditSmokePrompt = [
  "Audit https://example.com.",
  "",
  "Goal: smoke-test a single public URL for practical SEO issues. Keep the run read-only. Do not submit forms, bypass authentication, or mutate the target site.",
  "Use the framework's native sandbox commands such as `curl` or `node` (or runtime fetch) to retrieve the page and inspect titles, meta descriptions, headings, canonical/robots signals, and visible copy. Do not add or rely on a custom browser wrapper tool.",
  "Compare against prior local history under reports/seo-audit/history when available, and write artifacts under reports/seo-audit when filesystem access exists.",
  "Return a concise Markdown SEO report. If a capability is unavailable, call out the limitation clearly instead of skipping the report."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Scope and Method/i,
  /Previous[- ]vs[- ]Current/i,
  /Findings/i,
  /Content and Internal[- ]Link/i,
  /Recommended Next Actions/i,
  /Artifacts/i
] as const;

export const expectedReplyToken = "example.com";
