import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  ticketToPrSmokePrompt
} from "../shared/ticket-to-pr-smoke.js";

export default defineEval({
  description:
    "Verifies the ticket-to-PR agent reads the ticket via its review tool and returns a draft-first PR plan.",
  tags: ["smoke", "ticket-to-pr"],
  async test(t) {
    await t.send(ticketToPrSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_ticket");
    t.check(t.reply, includes("plan"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
