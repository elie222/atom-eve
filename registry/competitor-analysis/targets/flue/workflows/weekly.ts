import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/competitor-analysis.js";

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
    return session.prompt(
      "Run the weekly competitor analysis for the configured competitor URLs. Use native fetch/browser/sandbox capabilities, compare against reports/competitor-analysis/history when available, save report artifacts, and summarize notable deltas."
    );
  }
});
