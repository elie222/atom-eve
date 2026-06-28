import { defineSchedule } from "eve/schedules";
import { dailyRoutingPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyRoutingPrompt
});
