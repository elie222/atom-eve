import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly CRO audit for the configured landing pages. Use native Agent Browser to inspect each page and capture screenshots, apply conversion heuristics and the marketing-psychology skill, compare against reports/cro-optimizer/history when available, save report artifacts, and return ranked A/B test ideas with hypotheses.",
});
