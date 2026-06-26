import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  flakyTestFixerSmokePrompt,
  requiredReplyPatterns
} from "../shared/flaky-test-fixer-smoke.js";

export default defineEval({
  description:
    "Verifies the flaky test fixer agent reads CI runs via its review tool and returns a read-only flake diagnosis.",
  tags: ["smoke", "flaky-test-fixer"],
  async test(t) {
    await t.send(flakyTestFixerSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_ci_runs");
    t.check(t.reply, includes("flak"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
