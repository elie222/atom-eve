import { defineAgent } from "eve";

export default defineAgent({
  description: "Reviews recent production Sentry errors and proposes read-only triage with TDD fix plans."
});
