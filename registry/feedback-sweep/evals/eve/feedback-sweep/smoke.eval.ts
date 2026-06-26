import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  feedbackSweepSmokePrompt,
  requiredReplyPatterns
} from "../shared/feedback-sweep-smoke.js";

export default defineEval({
  description:
    "Verifies the Feedback Sweep agent reads issues via its review tool and returns a read-only audit reply.",
  tags: ["smoke", "feedback-sweep"],
  async test(t) {
    await t.send(feedbackSweepSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_issues");
    t.check(t.reply, includes("GitHub"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
