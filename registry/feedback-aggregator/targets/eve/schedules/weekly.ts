import { defineSchedule } from "eve/schedules";
import { weeklyFeedbackPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyFeedbackPrompt
});
