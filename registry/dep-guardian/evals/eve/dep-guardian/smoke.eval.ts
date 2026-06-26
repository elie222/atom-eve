import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  depGuardianSmokePrompt,
  expectedReplyToken,
  requiredReplyPatterns
} from "../shared/dep-guardian-smoke.js";

export default defineEval({
  description:
    "Verifies the Dependency Guardian agent reads the manifest via its review tool and returns risk-ordered, read-only update proposals.",
  tags: ["smoke", "dep-guardian"],
  async test(t) {
    await t.send(depGuardianSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("review_dependencies");
    t.check(t.reply, includes("dependenc"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
