import { defineSchedule } from "eve/schedules";
import { weeklyCleanupPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyCleanupPrompt
});
