import { defineSchedule } from "eve/schedules";
import { dailyPitchPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyPitchPrompt
});
