import { defineSchedule } from "eve/schedules";
import { CONTENT_IDEATION_WEEKLY_PROMPT } from "../lib/prompts.js";

export default defineSchedule({
  cron: "0 10 * * 1",
  markdown: CONTENT_IDEATION_WEEKLY_PROMPT
});
