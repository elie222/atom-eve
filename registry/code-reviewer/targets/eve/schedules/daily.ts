import { defineSchedule } from "eve/schedules";
import { dailyReviewPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyReviewPrompt
});
