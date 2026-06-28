import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 10 * * 1",
  markdown:
    "Create the weekly content ideation queue from recent business context. Review any available reports/content-ideation/history entries, avoid repeated ideas, and return YouTube topics, tweet/thread ideas, hooks, outlines, approval-ready social copy, Slack approval copy, and history update notes. Do not auto-post.",
});
