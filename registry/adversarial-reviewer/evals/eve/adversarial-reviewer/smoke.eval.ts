import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  adversarialReviewerSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/adversarial-reviewer-smoke.js";

export default defineEval({
  description:
    "Verifies the adversarial reviewer reads the PR via its review tool and returns a read-only second-opinion reply.",
  tags: ["smoke", "adversarial-reviewer"],
  async test(t) {
    await t.send(adversarialReviewerSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_pull_request");
    t.check(t.reply, includes("review"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
