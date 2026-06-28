import { defineSchedule } from "eve/schedules";
import { dailyDocsSyncPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyDocsSyncPrompt
});
