import { defineEval } from "eve/evals";
import {
  expectedReplyPattern,
  keywordResearcherSmokePrompt,
  keywordResearcherToolName
} from "../shared/keyword-researcher-smoke.js";

export default defineEval({
  description:
    "Verifies the Keyword Researcher agent calls the DataForSEO tool and returns a clustered, read-only content map.",
  tags: ["smoke", "keyword-researcher"],
  async test(t) {
    await t.send(keywordResearcherSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(keywordResearcherToolName);
    t.messageIncludes(expectedReplyPattern);
  }
});
