import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/competitor-analysis.js";
import { weeklyCompetitorAnalysisPrompt } from "../lib/agents/competitor-analysis/schedule.js";

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
    return session.prompt(weeklyCompetitorAnalysisPrompt);
  }
});
