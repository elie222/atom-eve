import { defineSchedule } from "eve/schedules";
import { dailyMentionsPrompt } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: dailyMentionsPrompt
});
