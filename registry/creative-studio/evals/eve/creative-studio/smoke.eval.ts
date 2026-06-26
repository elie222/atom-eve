import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  creativeStudioSmokePrompt,
  expectedReplyPatterns,
  generateCreativeToolName
} from "../shared/creative-studio-smoke.js";

export default defineEval({
  description:
    "Verifies the Creative Studio agent calls the creative generation tool and returns draft image variants for operator approval.",
  tags: ["smoke", "creative-studio"],
  async test(t) {
    await t.send(creativeStudioSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(generateCreativeToolName);
    t.check(t.reply, includes("draft"));

    for (const pattern of expectedReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
