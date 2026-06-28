import { defineSchedule } from "eve/schedules";
import { dailyLoopPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyLoopPrompt
});
