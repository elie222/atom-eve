import { defineSchedule } from "eve/schedules";
import { dailyErrorTriagePrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 8 * * *",
  markdown: dailyErrorTriagePrompt
});
