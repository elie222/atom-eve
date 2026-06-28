import { defineSchedule } from "eve/schedules";
import { dailyChasePrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyChasePrompt
});
