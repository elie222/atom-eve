import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly competitor analysis for the configured competitor URLs. Use native fetch/browser/sandbox capabilities, compare against reports/competitor-analysis/history when available, save new report artifacts, and summarize notable deltas."
});
