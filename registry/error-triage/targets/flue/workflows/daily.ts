import { createWorkflow } from "flue";
import { reviewSentryErrors } from "../tools/error-triage/sentry.js";

export default createWorkflow({
  name: "error-triage-daily",
  async run() {
    return reviewSentryErrors();
  }
});
