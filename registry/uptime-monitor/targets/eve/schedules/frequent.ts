import { defineSchedule } from "eve/schedules";
import { frequentCheckPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "*/15 * * * *",
  markdown: frequentCheckPrompt
});
