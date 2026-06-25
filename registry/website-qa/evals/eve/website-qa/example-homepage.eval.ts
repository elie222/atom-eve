import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  agentBrowserCommandPattern,
  requiredReportSectionPatterns,
  websiteQaSmokePrompt
} from "../shared/website-qa-smoke.js";

export default defineEval({
  description:
    "Verifies the Website QA agent uses browser automation and returns the expected Markdown report shape.",
  tags: ["smoke", "website-qa"],
  async test(t) {
    await t.send(websiteQaSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: agentBrowserCommandPattern } });
    t.check(t.reply, includes("example.com"));

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
