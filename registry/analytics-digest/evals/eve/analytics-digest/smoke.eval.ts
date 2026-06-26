import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  analyticsDigestSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/analytics-digest-smoke.js";

export default defineEval({
  description:
    "Verifies the analytics digest agent reads PostHog trends via its review tool and returns a plain-language weekly digest.",
  tags: ["smoke", "analytics-digest"],
  async test(t) {
    await t.send(analyticsDigestSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_trends");
    t.check(t.reply, includes("PostHog"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
