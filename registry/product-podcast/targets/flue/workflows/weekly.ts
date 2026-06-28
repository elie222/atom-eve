import { defineWorkflow } from "@flue/runtime";
import agent from "../agents/product-podcast.js";
import { weeklyPodcastPrompt } from "../lib/agents/product-podcast/schedule.js";

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
    return session.prompt(weeklyPodcastPrompt);
  }
});
