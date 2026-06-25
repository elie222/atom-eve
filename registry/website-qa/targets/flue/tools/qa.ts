import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fetchHtmlAudit, analyzeHtmlAudit, renderQaReport } from "../../lib/agents/website-qa/website.js";
import { runAgentBrowserAudit } from "./run-agent-browser.js";

export interface WebsiteQaInput {
  url: string;
  reportPath?: string;
  screenshotDir?: string;
  useBrowser?: boolean;
}

export async function runWebsiteQa(input: WebsiteQaInput) {
  const checkedAt = new Date().toISOString();
  const audit = await fetchHtmlAudit(input.url);
  const findings = analyzeHtmlAudit(audit);
  const browser = input.useBrowser === false ? { notes: ["Browser automation skipped by input."], screenshots: [] } : await runAgentBrowserAudit(input.url, input.screenshotDir);
  const report = renderQaReport({
    url: input.url,
    checkedAt,
    audit,
    findings,
    browserNotes: browser.notes,
    screenshots: browser.screenshots
  });
  const reportPath = input.reportPath ?? defaultReportPath(input.url);
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, report, "utf8");

  return {
    reportPath,
    findings,
    browser,
    audit
  };
}

function defaultReportPath(url: string): string {
  const safe = url.replace(/^https?:\/\//i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `reports/${safe || "website"}-${new Date().toISOString().slice(0, 10)}.md`;
}
