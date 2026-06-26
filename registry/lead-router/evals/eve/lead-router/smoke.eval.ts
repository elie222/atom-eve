import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  leadRouterSmokePrompt,
  requiredReplyPatterns
} from "../shared/lead-router-smoke.js";

export default defineEval({
  description:
    "Verifies the Lead Router agent reads HubSpot contacts via its review tool and returns a draft-first routing reply.",
  tags: ["smoke", "lead-router"],
  async test(t) {
    await t.send(leadRouterSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_leads");
    t.check(t.reply, includes("HubSpot"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
