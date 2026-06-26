import { defineEval } from "eve/evals";
import {
  buyerVoiceEveToolName,
  buyerVoiceReplyPattern,
  buyerVoiceSmokePrompt
} from "../shared/buyer-voice-smoke.js";

export default defineEval({
  description:
    "Verifies the Buyer Voice agent clusters objections via its planner and returns draft-first copy scaffolds.",
  tags: ["smoke", "buyer-voice"],
  async test(t) {
    await t.send(buyerVoiceSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool(buyerVoiceEveToolName);
    t.messageIncludes(buyerVoiceReplyPattern);
  }
});
