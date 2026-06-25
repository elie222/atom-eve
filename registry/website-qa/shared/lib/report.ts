import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

export interface QaReportInput {
  targetUrl: string;
  result: "passed" | "blocked" | "failed" | "incomplete";
  summary: string;
  checked: string[];
  findings: string[];
  evidence: string[];
  nextActions: string[];
  reportPath?: string;
}

export async function writeQaReport(input: QaReportInput) {
  const reportPath = input.reportPath ?? defaultReportPath(input.targetUrl);
  const report = renderQaReport(input);
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");

  return {
    reportPath,
    report,
  };
}

function renderQaReport(input: QaReportInput): string {
  return `# Website QA Report

Target: ${input.targetUrl}
Checked: ${new Date().toISOString()}
Result: ${input.result}

## Summary

${input.summary}

## What Was Checked

${list(input.checked)}

## Findings

${list(input.findings)}

## Evidence

${list(input.evidence)}

## Recommended Next Actions

${list(input.nextActions)}
`;
}

function list(items: string[]): string {
  return items.length ? items.map((item) => `- ${item}`).join("\n") : "- None";
}

function defaultReportPath(url: string): string {
  const safe = url.replace(/^https?:\/\//i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `reports/${safe || "website"}-${new Date().toISOString().slice(0, 10)}.md`;
}
