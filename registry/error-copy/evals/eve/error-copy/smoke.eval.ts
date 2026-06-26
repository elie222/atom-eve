import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  errorCopySmokePrompt,
  expectedReplyToken,
  requiredReportSectionPatterns
} from "../shared/error-copy-smoke.js";

export default defineEval({
  description:
    "Verifies the Error Copy agent crawls with the native browser (no custom tool) and returns a draft-first Markdown report of error copy rewrites.",
  tags: ["smoke", "error-copy"],
  async test(t) {
    await t.send(errorCopySmokePrompt);

    t.completed();
    t.noFailedActions();
    t.usedNoTools();
    t.check(t.reply, includes("example.com"));
    t.messageIncludes(expectedReplyToken);

    for (const section of requiredReportSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
