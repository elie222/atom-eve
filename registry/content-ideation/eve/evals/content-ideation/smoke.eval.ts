import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  contentIdeationSmokePrompt,
  expectedTokenPattern,
  requiredSectionPatterns
} from "../fixtures/content-ideation-smoke.js";

export default defineEval({
  description:
    "Verifies the Content Ideation agent returns the documented content-queue sections with proposed, approval-ready items.",
  tags: ["smoke", "content-ideation"],
  async test(t) {
    await t.send(contentIdeationSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.messageIncludes(expectedTokenPattern);
    t.check(t.reply, includes("YouTube"));

    for (const section of requiredSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
