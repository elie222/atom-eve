import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly UX review for the configured user task. Walk the task screen by screen with Agent Browser, capture a screenshot per screen, score each screen, and recommend read-only improvements for the weakest spots.",
});
