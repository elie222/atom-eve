import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  onboardingCoachSmokePrompt,
  requiredReplyPatterns
} from "../shared/onboarding-coach-smoke.js";

export default defineEval({
  description:
    "Verifies the onboarding coach reads the activation funnel via its review tool and returns a draft-first reply.",
  tags: ["smoke", "onboarding-coach"],
  async test(t) {
    await t.send(onboardingCoachSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_activation");
    t.check(t.reply, includes("PostHog"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
