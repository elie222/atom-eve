import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly error copy review for the configured app URLs and flows. Use native browser/sandbox capabilities to surface user-facing error messages, confirm which states are reachable, capture evidence, and present before/after rewrite drafts for clarity and empathy without changing anything.",
});
