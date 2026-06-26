import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  emailLoopsSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/email-loops-smoke.js";

export default defineEval({
  description:
    "Verifies the Loops email agent reads the audience via its review tool and returns a draft-first reply.",
  tags: ["smoke", "email-loops"],
  async test(t) {
    await t.send(emailLoopsSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_audience");
    t.check(t.reply, includes("Loops"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
