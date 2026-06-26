import { defineSchedule } from "eve/schedules";
import { weeklyRestoreCheckPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyRestoreCheckPrompt
});
