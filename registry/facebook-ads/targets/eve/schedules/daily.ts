import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown: "Run the Facebook Ads daily loop and summarize the recommended campaign actions."
});
