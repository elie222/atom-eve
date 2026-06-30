import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown:
    "Run the daily backlink prospecting workflow for the configured project domain and competitor domains. Find domains linking to competitors but not to the project with DataForSEO, verify contact paths without submitting forms or sending email, and export up to the configured daily target count as a CSV under reports/backlink-prospector/<YYYY-MM-DD>/prospects.csv. If the project domain, competitors, daily target, or DataForSEO credentials are missing, report that the run is blocked.",
});
