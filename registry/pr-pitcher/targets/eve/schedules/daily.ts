import { defineSchedule } from "eve/schedules";
import { dailyPitchPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyPitchPrompt
});
