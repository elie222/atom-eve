import { defineEval } from "eve/evals";
import { includes } from "eve/evals/expect";
import {
  expectedReplyToken,
  kpiDigestSmokePrompt,
  requiredReplyPatterns
} from "../shared/kpi-digest-smoke.js";

export default defineEval({
  description:
    "Verifies the KPI digest agent reads revenue and product KPIs via its review tool and returns a combined read-only digest.",
  tags: ["smoke", "kpi-digest"],
  async test(t) {
    await t.send(kpiDigestSmokePrompt);

    t.completed();
    t.noFailedActions();
    t.calledTool("review_kpis");
    t.check(t.reply, includes("KPI"));
    t.messageIncludes(expectedReplyToken);

    for (const pattern of requiredReplyPatterns) {
      t.messageIncludes(pattern);
    }
  }
});
