import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly claim check for the configured marketing site. Use native fetch/browser/sandbox capabilities to crawl pages and inventory every customer-facing claim, verify each against the configured product sources of truth, flag and draft repairs for the riskiest overstatements (read-only), compare against reports/claim-checker/history when available, save report artifacts, and summarize the highest-risk claims.",
});
