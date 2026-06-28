import { defineSchedule } from "eve/schedules";
import { weeklyClaimCheckPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyClaimCheckPrompt
});
