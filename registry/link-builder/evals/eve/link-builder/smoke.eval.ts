import { defineEval } from "eve/evals";
import {
  expectedReplyPattern,
  linkBuilderSmokePrompt,
  linkBuilderToolName
} from "../shared/link-builder-smoke.js";

export default defineEval({
  description:
    "Verifies the Link Builder agent calls the prospecting planner and returns draft-first outreach.",
  tags: ["smoke", "link-builder"],
  async test(t) {
    await t.send(linkBuilderSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(linkBuilderToolName);
    t.messageIncludes(expectedReplyPattern);
  }
});
