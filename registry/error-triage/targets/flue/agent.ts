import { createAgent } from "flue";
import { reviewSentryErrors } from "../tools/error-triage/sentry.js";

export default createAgent({
  name: "error-triage",
  instructions: "Review recent production Sentry errors in read-only mode and recommend severity-ranked TDD fix plans.",
  tools: [reviewSentryErrors]
});
