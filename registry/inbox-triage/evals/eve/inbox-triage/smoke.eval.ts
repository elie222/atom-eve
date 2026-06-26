import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  inboxTriageSmokePrompt,
  requiredReplyPatterns
} from "../shared/inbox-triage-smoke.js";

export default defineEval({
  description:
    "Verifies the inbox triage agent reads the inbox via its review tool and returns a draft-first triage.",
  tags: ["smoke", "inbox-triage"],
  async test(t) {
    await t.send(inboxTriageSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_inbox");
    t.check(t.reply, includes("inbox"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
