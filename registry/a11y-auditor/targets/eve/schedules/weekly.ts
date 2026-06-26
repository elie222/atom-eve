import { defineSchedule } from "eve/schedules";
import { weeklyA11yAuditPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyA11yAuditPrompt
});
