export const croOptimizerSmokePrompt = [
  "Run a CRO audit for https://example.com.",
  "",
  "Goal: audit the public landing page only. Do not sign up, submit forms, use payment, bypass CAPTCHA, or use credentials.",
  "First run bash setup-agent-browser.sh. Then use Agent Browser in the sandbox to open the page, inspect a snapshot, and capture one screenshot under reports/cro-optimizer/artifacts/example-home.png.",
  "Apply conversion heuristics and return a concise Markdown report with ranked A/B test ideas and hypotheses. If browser automation is unavailable, report that blocker clearly instead of doing a static HTML or SEO audit."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Pages Reviewed/i,
  /Conversion Heuristic Findings/i,
  /A\/B Test Ideas/i,
  /Screenshots?\s*(?:and|\/)?\s*Artifacts?/i,
  /Recommended Next Steps/i
] as const;

export const agentBrowserCommandPattern = /agent-browser/;
