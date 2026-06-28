import { defineSchedule } from "eve/schedules";
import { dailyNudgePrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyNudgePrompt
});
