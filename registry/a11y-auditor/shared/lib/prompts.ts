// Trigger prompt for this project's accessibility auditor schedule. Agent behavior now lives in
// shared/instructions.md.

export const weeklyA11yAuditPrompt =
  "Run the weekly accessibility audit for the configured key pages. Use native browser/sandbox capabilities to crawl each page, inject and run axe-core, group WCAG violations by user harm with proposed read-only fixes, save report artifacts under reports/a11y-auditor, and summarize the highest-harm issues.";
