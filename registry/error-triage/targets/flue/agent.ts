import { defineAgent } from "@flue/runtime";
import { reviewSentryErrors } from "../tools/error-triage/sentry.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "Review recent production Sentry errors in read-only mode and recommend severity-ranked TDD fix plans.",
  tools: [reviewSentryErrors]
}));
