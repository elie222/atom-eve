import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly SEO audit for the configured production URL(s) or sitemap. Use curl/node/fetch for headers and parsing and Agent Browser in the sandbox for visible copy, CTA, and rendered-page checks. Audit the current state of the site, then write a concise read-only Markdown report with findings ordered by severity. If no URL is configured, report that the run is blocked. Do not submit forms or mutate the site.",
});
