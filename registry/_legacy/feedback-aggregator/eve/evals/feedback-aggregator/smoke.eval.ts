import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  feedbackAggregatorSmokePrompt,
  requiredReplyPatterns
} from "../fixtures/feedback-aggregator-smoke.js";

export default defineEval({
  description:
    "Verifies the feedback aggregator dedupes items via its tool and returns ranked themes for operator review.",
  tags: ["smoke", "feedback-aggregator"],
  async test(t) {
    await t.send(feedbackAggregatorSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("aggregate_feedback");
    t.check(t.reply, includes("theme"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
