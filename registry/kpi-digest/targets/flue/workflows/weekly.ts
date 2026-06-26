import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/kpi-digest.js";
import { weeklyKpiPrompt } from "../lib/agents/kpi-digest/prompts.js";

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
    return session.prompt(weeklyKpiPrompt);
  }
});
