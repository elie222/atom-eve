export const claimCheckerSmokePrompt = [
  "Run a claim check on https://example.com.",
  "",
  "Goal: smoke-test the public homepage only. Crawl the page, inventory the customer-facing claims, and mark each as supported, unverified, or overstated. You are read-only: do not edit or publish anything, only draft suggested repairs.",
  "First run bash setup-agent-browser.sh. Then use Agent Browser in the sandbox to open the page, inspect a snapshot, and capture one screenshot under reports/claim-checker/artifacts/example-home.png.",
  "Return a concise Markdown claim-check report. If browser automation is unavailable, report that blocker clearly instead of doing a static-only audit."
].join("\n");

export const requiredReportSectionPatterns = [
  /Executive Summary/i,
  /Pages and Claims Reviewed/i,
  /Claim Inventory/i,
  /Risk Assessment/i,
  /Flagged Overstatements/i,
  /Suggested Repairs/i,
  /Screenshots?\s*\/?\s*Artifacts?/i,
  /Recommended Actions/i
] as const;

export const agentBrowserCommandPattern = /agent-browser/;
