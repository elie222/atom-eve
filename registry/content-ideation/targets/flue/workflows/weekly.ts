import { defineWorkflow } from "@flue/runtime";

export default defineWorkflow({
  name: "content-ideation-weekly",
  async run() {
    return {
      prompt:
        "Create the weekly content ideation queue from recent business context. Review any available reports/content-ideation/history entries, avoid repeated ideas, and return YouTube topics, tweet/thread ideas, hooks, outlines, approval-ready social copy, Slack approval copy, and history update notes. Do not auto-post."
    };
  }
});
