import { defineSchedule } from "eve/schedules";
import { dailyRoutingPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyRoutingPrompt
});
