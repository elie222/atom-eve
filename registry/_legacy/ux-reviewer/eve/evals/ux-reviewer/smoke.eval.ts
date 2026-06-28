import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  expectedReplyToken,
  requiredReportSectionPatterns,
  uxReviewerSmokePrompt
} from "../fixtures/ux-reviewer-smoke.js";

export default defineEval({
  description:
    "Verifies the UX Reviewer agent drives the browser and returns the expected scored Markdown report shape.",
  tags: ["smoke", "ux-reviewer"],
  async test(t) {
    await t.send(uxReviewerSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: agentBrowserCommandPattern } });
    t.check(t.reply, includes(expectedReplyToken));

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
