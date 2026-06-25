import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/error-triage.js";

interface WorkflowContext {
  harness: {
    session(): Promise<{
      prompt(message: string): Promise<unknown>;
    }>;
  };
}

export default defineWorkflow({
  agent,
  async run({ harness }: WorkflowContext) {
    const session = await harness.session();
    return session.prompt("Run the read-only error triage review for recent production Sentry errors and summarize severity, likely owners/files, regressions, and TDD fix plans.");
  }
});
