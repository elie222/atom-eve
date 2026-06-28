import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  docsSyncSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../fixtures/docs-sync-smoke.js";

export default defineEval({
  description:
    "Verifies the Docs Sync agent reads recent changes via its review tool and returns a draft-first doc update proposal.",
  tags: ["smoke", "docs-sync"],
  async test(t) {
    await t.send(docsSyncSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_changes");
    t.check(t.reply, includes("doc"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
