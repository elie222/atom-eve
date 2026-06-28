import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Review this project's PostHog funnels and retention for the past week using posthog-cli in the sandbox. Discover the right tools (search/info), confirm events with read-data-schema, then build the funnel and retention/cohort views, identify the biggest drop-off and the retention trend, and recommend where to focus. Read-only: do not modify any PostHog configuration.",
});
