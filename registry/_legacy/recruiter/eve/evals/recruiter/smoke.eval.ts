import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  recruiterSmokePrompt,
  requiredReplyPatterns
} from "../fixtures/recruiter-smoke.js";

export default defineEval({
  description:
    "Verifies the recruiter agent reads applicants via its review tool and returns a draft-first shortlist reply.",
  tags: ["smoke", "recruiter"],
  async test(t) {
    await t.send(recruiterSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_applicants");
    t.check(t.reply, includes("Ashby"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
