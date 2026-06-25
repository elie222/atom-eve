import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/content-ideation.js";

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
      "Create the weekly content ideation queue from recent business context. Review any available reports/content-ideation/history entries, avoid repeated ideas, and return YouTube topics, tweet/thread ideas, hooks, outlines, approval-ready social copy, Slack approval copy, and history update notes. Do not auto-post."
    );
  }
});
