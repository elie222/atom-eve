import { defineSchedule } from "eve/schedules";
import { weeklyLinkBuildingPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyLinkBuildingPrompt
});
