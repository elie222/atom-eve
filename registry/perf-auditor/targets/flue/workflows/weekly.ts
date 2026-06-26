import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/perf-auditor.js";
import { weeklyPerfAuditPrompt } from "../lib/agents/perf-auditor/prompts.js";

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
    return session.prompt(weeklyPerfAuditPrompt);
  }
});
