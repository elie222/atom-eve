import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  expectedReplyToken,
  perfAuditorSmokePrompt,
  requiredReportSectionPatterns
} from "../shared/perf-auditor-smoke.js";

export default defineEval({
  description:
    "Verifies the Performance Auditor agent uses browser automation and returns the expected Markdown report shape with a single worst bottleneck and a behavior-preserving fix.",
  tags: ["smoke", "perf-auditor"],
  async test(t) {
    await t.send(perfAuditorSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: agentBrowserCommandPattern } });
    t.check(t.reply, includes("example.com"));
    t.messageIncludes(expectedReplyToken);

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
