import { defineSchedule } from "eve/schedules";
import { dailyStandupPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyStandupPrompt
});
