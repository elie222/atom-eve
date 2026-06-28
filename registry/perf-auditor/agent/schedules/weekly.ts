import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly performance audit for the configured URLs. Use native browser/sandbox capabilities to measure load timings and transfer weight, identify the single worst bottleneck, propose one behavior-preserving fix, compare against reports/perf-auditor/history when available, and save report artifacts.",
});
