import { defineSchedule } from "eve/schedules";
import { dailyLoopPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyLoopPrompt
});
