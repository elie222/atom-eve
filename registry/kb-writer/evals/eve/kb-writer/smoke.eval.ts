import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  kbWriterSmokePrompt,
  requiredReplyPatterns
} from "../shared/kb-writer-smoke.js";

export default defineEval({
  description:
    "Verifies the knowledge base writer agent reads Intercom via its review tool and returns draft-first articles.",
  tags: ["smoke", "kb-writer"],
  async test(t) {
    await t.send(kbWriterSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_tickets");
    t.check(t.reply, includes("Intercom"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
