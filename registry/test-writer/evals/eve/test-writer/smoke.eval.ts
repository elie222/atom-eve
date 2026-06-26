import { defineEval } from "eve/evals";
import {
  testWriterEveToolName,
  testWriterReplyPattern,
  testWriterSmokePrompt
} from "../shared/test-writer-smoke.js";

export default defineEval({
  description:
    "Verifies the Test Writer agent surfaces untested paths via its planner and returns draft-first test cases and assertions.",
  tags: ["smoke", "test-writer"],
  async test(t) {
    await t.send(testWriterSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool(testWriterEveToolName);
    t.messageIncludes(testWriterReplyPattern);
  }
});
