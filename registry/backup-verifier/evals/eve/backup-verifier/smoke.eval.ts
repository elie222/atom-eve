import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { backupVerifierSmokePrompt, expectedReplyPattern } from "../shared/backup-verifier-smoke.js";

export default defineEval({
  description:
    "Verifies the backup verifier agent drafts clean-room restore-and-verify steps and reports coverage gaps for operator review.",
  tags: ["smoke", "backup-verifier"],
  async test(t) {
    await t.send(backupVerifierSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("plan_restore_check");
    t.check(t.reply, includes("restore"));
    t.messageIncludes(expectedReplyPattern);
  }
});
