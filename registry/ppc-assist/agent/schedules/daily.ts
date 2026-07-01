import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 8 * * *",
  markdown:
    "Run the configured PPC Assist daily triage. Use the configured store, markets, KPI thresholds, lifecycle notes, exclusions, and write policy. Read PPC Assist account data, produce a concise prioritized report, and do not apply account changes unless the run explicitly configured approved writes and the tool approval gate is satisfied. If the configured store or PPC Assist connection is missing or unauthorized, report that the run is blocked.",
});
