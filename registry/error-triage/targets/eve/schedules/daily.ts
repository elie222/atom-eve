import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 8 * * *",
  markdown: "Run the read-only error triage review for recent production Sentry errors and summarize severity, likely owners/files, regressions, and TDD fix plans."
});
