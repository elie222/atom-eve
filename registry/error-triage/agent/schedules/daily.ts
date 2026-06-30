import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown:
    "Run the daily Sentry error triage for the configured organization and project. Use `sentry api` in the sandbox for bounded read-only issue, event, release, tag, stack trace, and frequency data. Group likely shared causes and return a prioritized Markdown debugging report with evidence, owners or code areas, first investigation steps, and telemetry blockers. If Sentry credentials, organization, or project are missing, report that the run is blocked.",
});
