import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  expectedReplyToken,
  requiredReportSectionPatterns,
  a11yAuditorSmokePrompt
} from "../shared/a11y-auditor-smoke.js";

export default defineEval({
  description:
    "Verifies the Accessibility Auditor agent uses browser automation and returns the expected WCAG report shape.",
  tags: ["smoke", "a11y-auditor"],
  async test(t) {
    await t.send(a11yAuditorSmokePrompt);

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
