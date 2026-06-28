import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Run the weekly experiment review. Use posthog-cli in the sandbox (discover experiment tools with `posthog-cli api search experiment`, run `posthog-cli api info <tool>` before each call, then `posthog-cli api call <tool>`), read the PostHog experiments, flag which reached significance, name the winning variant where there is one, and summarize the key learnings. Stay read-only and do not change any experiment or feature flag.",
});
