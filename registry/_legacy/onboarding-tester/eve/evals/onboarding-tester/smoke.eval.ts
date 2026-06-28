import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  blockerToken,
  cleanSetupCommandPattern,
  onboardingTesterSmokePrompt,
  requiredReportSectionPatterns
} from "../fixtures/onboarding-tester-smoke.js";

export default defineEval({
  description:
    "Verifies the Onboarding Tester agent follows clean setup via sandbox commands and returns the expected read-only Markdown report shape.",
  tags: ["smoke", "onboarding-tester"],
  async test(t) {
    await t.send(onboardingTesterSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: cleanSetupCommandPattern } });
    t.check(t.reply, includes("README"));
    t.messageIncludes(blockerToken);

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
