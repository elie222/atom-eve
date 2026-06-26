import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  errorTriageSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/error-triage-smoke.js";

export default defineEval({
  description:
    "Verifies the Error Triage agent reads recent errors via its review tool and returns a read-only triage report.",
  tags: ["smoke", "error-triage"],
  async test(t) {
    await t.send(errorTriageSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_errors");
    t.check(t.reply, includes("error"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
