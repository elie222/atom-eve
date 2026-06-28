import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly onboarding test. Starting from a clean checkout, follow this project's README and documented setup steps as a first-time developer would, using native sandbox commands and the native browser to verify the app loads. Stop at the first blocker, confirm it by retrying from clean, and report the exact doc or script fix needed. Do not change any project files.",
});
