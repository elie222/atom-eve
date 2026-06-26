import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import { statusCommsSmokePrompt, expectedReplyPattern } from "../shared/status-comms-smoke.js";

export default defineEval({
  description:
    "Verifies the status comms agent scaffolds a status update and post-mortem outline and presents both as drafts for approval.",
  tags: ["smoke", "status-comms"],
  async test(t) {
    await t.send(statusCommsSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("draft_incident_update");
    t.check(t.reply, includes("draft"));
    t.messageIncludes(expectedReplyPattern);
  }
});
