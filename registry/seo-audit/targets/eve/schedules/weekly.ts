import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  timezone: "UTC",
  prompt:
    "Run the weekly SEO audit for https://example.com or its sitemap. Replace this placeholder with the production URL before enabling the schedule. Compare against reports/seo-audit/history and write reports/seo-audit/latest.md."
});
