import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description: "Reviews recent production Sentry errors and proposes read-only triage with TDD fix plans."
});
