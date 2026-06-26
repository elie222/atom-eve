import { defineSchedule } from "eve/schedules";
import { dailyRadarPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyRadarPrompt
});
