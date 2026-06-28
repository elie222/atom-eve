import { defineSchedule } from "eve/schedules";
import { dailyTriagePrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyTriagePrompt
});
