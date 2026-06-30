import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown:
    "Draft today's standup digest from this project's configured Slack channel. Use `read_updates` for the last 24 hours, group observed messages into priorities, active threads and blockers, and wins, then return a read-only Markdown draft for operator approval. Do not post, reply, react, or claim that anything was sent.",
});
