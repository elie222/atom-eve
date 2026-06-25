import { writeQaReport, type QaReportInput } from "../../lib/agents/website-qa/report.js";

export async function writeWebsiteQaReport(input: QaReportInput) {
  return writeQaReport(input);
}
