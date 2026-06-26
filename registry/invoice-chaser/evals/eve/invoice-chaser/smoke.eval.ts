import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  invoiceChaserSmokePrompt,
  requiredReplyPatterns
} from "../shared/invoice-chaser-smoke.js";

export default defineEval({
  description:
    "Verifies the invoice chaser agent reads invoices via its review tool and returns a draft-first aging summary and reminders.",
  tags: ["smoke", "invoice-chaser"],
  async test(t) {
    await t.send(invoiceChaserSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_invoices");
    t.check(t.reply, includes("invoice"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
