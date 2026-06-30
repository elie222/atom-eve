import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown:
    "Review open Intercom conversations. Use `read_conversations` with conversation parts, draft grounded replies for operator approval, and flag priority, SLA, sensitive, or uncertain cases for human escalation. Do not reply, close, snooze, assign, tag, or claim that anything changed.",
});
