import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/release-notes.js";
import { weeklyReleaseNotesPrompt } from "../lib/agents/release-notes/schedule.js";

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
    return session.prompt(weeklyReleaseNotesPrompt);
  }
});
