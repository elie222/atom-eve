import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly SEO improver loop for the configured project domain and tracked keywords. Pull current rankings from DataForSEO, read the most recent prior run under reports/seo-improver/ to compute week-over-week movement, and check whether last week's recommended improvements were applied and moved position. Then write rankings.csv and report.md under reports/seo-improver/<YYYY-MM-DD>/ with the movement summary and a short, high-conviction action list of specific on-page changes. Keep the run read-only against the site. If the domain, tracked keywords, or DataForSEO credentials are missing, report that the run is blocked.",
});
