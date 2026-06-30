import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1-5",
  markdown:
    "Run the daily dunning triage for failed Stripe payments in the last 24 hours plus currently past-due subscriptions and open automatic-collection invoices. Use the Stripe CLI in the sandbox, stay read-only, group by customer, and return a prioritized Markdown recovery queue with evidence, next actions, and draft reminder copy. If Stripe credentials or recovery policy context are missing, report that the run is blocked.",
});
