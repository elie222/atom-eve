import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  claimCheckerSmokePrompt,
  requiredReportSectionPatterns
} from "../shared/claim-checker-smoke.js";

export default defineEval({
  description:
    "Verifies the Claim Checker agent crawls with browser automation and returns the expected Markdown claim-check report shape.",
  tags: ["smoke", "claim-checker"],
  async test(t) {
    await t.send(claimCheckerSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: agentBrowserCommandPattern } });
    t.check(t.reply, includes("example.com"));

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
