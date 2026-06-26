import { defineSchedule } from "eve/schedules";
import { weeklyPerfAuditPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyPerfAuditPrompt
});
