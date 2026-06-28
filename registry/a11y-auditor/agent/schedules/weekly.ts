import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly accessibility audit for the configured key pages. Use native browser/sandbox capabilities to crawl each page, inject and run axe-core, group WCAG violations by user harm with proposed read-only fixes, save report artifacts under reports/a11y-auditor, and summarize the highest-harm issues.",
});
