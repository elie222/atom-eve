import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  codeReviewerSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../fixtures/code-reviewer-smoke.js";

export default defineEval({
  description:
    "Verifies the code reviewer agent reads open pull requests via its review tool and returns draft-first review notes.",
  tags: ["smoke", "code-reviewer"],
  async test(t) {
    await t.send(codeReviewerSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_pull_requests");
    t.check(t.reply, includes("pull request"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
