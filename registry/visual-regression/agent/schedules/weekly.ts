import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly visual regression check for this project's configured key screens. Use native browser/sandbox capabilities to capture current screenshots under reports/visual-regression/current, compare them against reports/visual-regression/baseline, and return a concise Markdown report of unintended UI diffs. Do not update the baseline or change any UI.",
});
