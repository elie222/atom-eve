import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  crmHygieneSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/crm-hygiene-smoke.js";

export default defineEval({
  description:
    "Verifies the CRM hygiene agent reads HubSpot contacts via its review tool and returns a read-only cleanup report.",
  tags: ["smoke", "crm-hygiene"],
  async test(t) {
    await t.send(crmHygieneSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_contacts");
    t.check(t.reply, includes("HubSpot"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
