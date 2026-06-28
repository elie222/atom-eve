import { defineSchedule } from "eve/schedules";
import { frequentCheckPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "*/15 * * * *",
  markdown: frequentCheckPrompt
});
