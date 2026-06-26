import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { emailUserlistSmokePrompt, expectedReplyPattern } from "../shared/email-userlist-smoke.js";

export default defineEval({
  description:
    "Verifies the Userlist email agent plans the lifecycle events and drafts campaign copy for operator approval.",
  tags: ["smoke", "email-userlist"],
  async test(t) {
    await t.send(emailUserlistSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("plan_campaign");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedReplyPattern);
  }
});
