import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyPattern,
  requiredBriefSectionPatterns,
  researchAssistantSmokePrompt
} from "../shared/research-assistant-smoke.js";

export default defineEval({
  description:
    "Verifies the Research Assistant agent returns a sourced, cited brief with the expected sections and no custom tool.",
  tags: ["smoke", "research-assistant"],
  async test(t) {
    await t.send(researchAssistantSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.usedNoTools();
    t.check(t.reply, includes("caching"));
    t.messageIncludes(expectedReplyPattern);

    for (const section of requiredBriefSectionPatterns) {
      t.messageIncludes(section);
    }
  }
});
