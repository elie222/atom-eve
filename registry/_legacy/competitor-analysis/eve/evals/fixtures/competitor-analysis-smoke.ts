export const competitorAnalysisSmokePrompt = [
  "Run a competitor analysis for the single competitor https://example.com.",
  "",
  "Goal: smoke-test the public homepage only. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials.",
  "Use native fetch or sandbox command execution plus the framework's browser capability to inspect the page; do not install or call a custom browser wrapper tool.",
  "Save artifacts under reports/competitor-analysis/artifacts/<date>/ when possible. If history is unavailable because the sandbox is fresh, say so and establish a baseline.",
  "Return a concise Markdown competitor analysis report. If browser automation is unavailable, report that blocker clearly instead of inventing competitors or claims."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Competitors? (and|&) URLs Reviewed/i,
  /Positioning/i,
  /Pricing/i,
  /CTA Flow/i,
  /Screenshots?\s*\/?\s*(and )?Artifacts?/i,
  /(Notable )?Deltas/i,
  /Recommended Actions/i
] as const;

export const sandboxCommandPattern = /mkdir|curl|fetch|reports\/competitor-analysis/;

export const expectedUrlToken = "example.com";
