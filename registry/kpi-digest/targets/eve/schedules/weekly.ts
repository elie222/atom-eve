import { defineSchedule } from "eve/schedules";
import { weeklyKpiPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyKpiPrompt
});
