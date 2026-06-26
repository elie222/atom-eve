import { defineSchedule } from "eve/schedules";
import { dailyNudgePrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyNudgePrompt
});
