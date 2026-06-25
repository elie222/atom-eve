import { defineWorkflow } from "@flue/runtime";

export default defineWorkflow({
  name: "competitor-analysis-weekly",
  async run() {
    return {
      prompt:
        "Run the weekly competitor analysis for the configured competitor URLs. Use native fetch/browser/sandbox capabilities, compare against reports/competitor-analysis/history when available, save report artifacts, and summarize notable deltas."
    };
  }
});
