import { defineSchedule } from "eve/schedules";
import { outreachLoopPrompt } from "../schedule.js";

export default defineSchedule({
  cron: "0 9 */3 * *",
  markdown: outreachLoopPrompt
});
