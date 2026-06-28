import { defineSchedule } from "eve/schedules";
import { weeklyReleaseNotesPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown: weeklyReleaseNotesPrompt
});
