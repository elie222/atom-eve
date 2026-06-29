import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 10 * * 1",
  markdown:
    "Run the weekly content research and planning workflow for the configured topics, audience, channels, and product context. Use the last30days skill for current conversation research, compare against reports/content-agent/history when available, and return an approval-ready content plan with briefs, hooks, drafts, and history update notes.",
});
