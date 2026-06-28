import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  requiredReplyPatterns,
  uptimeMonitorSmokePrompt
} from "../fixtures/uptime-monitor-smoke.js";

export default defineEval({
  description:
    "Verifies the uptime monitor agent checks the endpoint via its check_endpoints tool and returns a read-only health summary.",
  tags: ["smoke", "uptime-monitor"],
  async test(t) {
    await t.send(uptimeMonitorSmokePrompt);

    t.succeeded();
    t.noFailedActions();
    t.calledTool("check_endpoints");
    t.check(t.reply, includes("example.com"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
