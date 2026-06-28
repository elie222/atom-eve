import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Review this project's PostHog event trends for the last week, then write a plain-language weekly digest. Use posthog-cli in the sandbox (discover with `posthog-cli api search`, inspect with `posthog-cli api info`, then `posthog-cli api call`). Lead with the headline movement, call out events that rose or fell materially, and flag anything worth investigating. Present it as a read-only summary; do not claim to have changed any tracking or configuration.",
});
