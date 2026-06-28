import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  onboardingCoachSmokePrompt,
  posthogCliCommandPattern,
  requiredReplyPatterns
} from "../fixtures/onboarding-coach-smoke.js";

export default defineEval({
  description:
    "Verifies the onboarding coach reads the activation funnel via posthog-cli in the sandbox and returns a draft-first reply.",
  tags: ["smoke", "onboarding-coach"],
  async test(t) {
    await t.send(onboardingCoachSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("bash", { input: { command: posthogCliCommandPattern } });
    t.check(t.reply, includes("PostHog"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
