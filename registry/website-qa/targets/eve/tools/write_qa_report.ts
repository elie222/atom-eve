import { defineTool } from "eve/tools";
import { z } from "zod";

import { writeQaReport } from "../lib/report.js";

const inputSchema = z.object({
  targetUrl: z.string().min(1),
  result: z.enum(["passed", "blocked", "failed", "incomplete"]),
  summary: z.string().min(1),
  checked: z.array(z.string()),
  findings: z.array(z.string()),
  evidence: z.array(z.string()),
  nextActions: z.array(z.string()),
  reportPath: z.string().optional(),
});

type WriteQaReportToolInput = z.infer<typeof inputSchema>;

export default defineTool({
  description: "Write the final Markdown QA report after completing the browser-driven test flow.",
  inputSchema,
  async execute(input: WriteQaReportToolInput) {
    return writeQaReport(input);
  },
});
