import { defineSchedule } from "eve/schedules";
import { dailyErrorTriagePrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 8 * * *",
  markdown: dailyErrorTriagePrompt
});
