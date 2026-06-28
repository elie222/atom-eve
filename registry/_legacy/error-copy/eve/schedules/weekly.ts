import { defineSchedule } from "eve/schedules";
import { weeklyErrorCopyPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyErrorCopyPrompt
});
