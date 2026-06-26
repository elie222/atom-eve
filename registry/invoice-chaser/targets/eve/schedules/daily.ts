import { defineSchedule } from "eve/schedules";
import { dailyChasePrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyChasePrompt
});
