import { defineSchedule } from "eve/schedules";
import { dailyScanPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyScanPrompt
});
