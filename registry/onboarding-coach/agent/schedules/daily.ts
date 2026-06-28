import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * *",
  markdown:
    "Review this project's PostHog activation funnel and draft nudges for users stuck before activation. Use posthog-cli api in the sandbox following the discover -> info -> call workflow (search/tools, then info <tool>, then call <tool>) to read the funnel. Identify the onboarding steps with the worst drop-off and present a draft nudge per step with the step it targets and the trigger condition for approval. Stay read-only and do not send anything automatically.",
});
