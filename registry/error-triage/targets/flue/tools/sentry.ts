import { reviewSentryErrors as reviewErrors } from "../../lib/agents/error-triage/sentry.js";

export async function reviewSentryErrors() {
  return reviewErrors();
}
