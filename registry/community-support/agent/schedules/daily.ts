import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown:
    "Review recent Discord support messages from the configured channel. Use `read_messages`, identify open questions, draft grounded replies for operator approval, and flag sensitive or uncertain items for human escalation. Do not post, react, moderate, or claim that anything was sent.",
});
