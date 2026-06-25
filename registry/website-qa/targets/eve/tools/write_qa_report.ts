import { defineTool } from "eve/tools";

import { qaReportInputSchema, writeQaReport, type QaReportInput } from "../lib/report.js";

export default defineTool({
  description: "Write the final Markdown QA report after completing the browser-driven test flow.",
  inputSchema: qaReportInputSchema,
  async execute(input: QaReportInput) {
    return writeQaReport(input);
  },
});
