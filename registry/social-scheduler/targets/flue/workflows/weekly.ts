import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/social-scheduler.js";
import { weeklySchedulePrompt } from "../lib/agents/social-scheduler/schedule.js";

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
    return session.prompt(weeklySchedulePrompt);
  }
});
