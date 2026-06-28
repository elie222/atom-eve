import { defineSchedule } from "eve/schedules";
import { weeklyVisualRegressionPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyVisualRegressionPrompt
});
