import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { spawn } from "node:child_process";
import { defineTool } from "eve/tools";
import { z } from "zod";
import { fetchHtmlAudit, analyzeHtmlAudit, renderQaReport } from "../lib/website.js";

interface WebsiteQaInput {
  url: string;
  reportPath?: string;
  screenshotDir?: string;
  useBrowser?: boolean;
}

export default defineTool({
  description: "Audit a public website and write a Markdown QA report with optional Agent Browser evidence.",
  inputSchema: z.object({
    url: z.string().min(1).describe("Website URL to audit."),
    reportPath: z.string().optional().describe("Where to write the Markdown report, relative to the project runtime."),
    screenshotDir: z.string().optional().describe("Directory for Agent Browser screenshots."),
    useBrowser: z.boolean().optional().describe("Set false to skip Agent Browser automation.")
  }),
  async execute(input: WebsiteQaInput) {
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
});

async function runAgentBrowserAudit(url: string, screenshotDir = "reports/assets") {
  const available = await commandSucceeds("agent-browser", ["--help"]);
  if (!available) {
    return {
      notes: ["agent-browser CLI was not found. Install it to enable screenshots and interactive checks."],
      screenshots: []
    };
  }

  await mkdir(screenshotDir, { recursive: true });
  const screenshotPath = path.join(screenshotDir, `${safeName(url)}.png`);
  const commands = [
    ["open", normalizeUrl(url)],
    ["wait", "--load", "networkidle"],
    ["screenshot", "--full", screenshotPath]
  ];

  const notes: string[] = [];
  for (const args of commands) {
    const result = await run("agent-browser", args);
    if (result.trim()) notes.push(result.trim().slice(0, 1000));
  }

  return {
    notes,
    screenshots: [screenshotPath]
  };
}

async function commandSucceeds(command: string, args: string[]): Promise<boolean> {
  const result = await run(command, args).catch(() => null);
  return result !== null;
}

async function run(command: string, args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code === 0) resolve(stdout);
      else reject(new Error(stderr || `${command} exited with code ${code}`));
    });
  });
}

function defaultReportPath(url: string): string {
  const safe = url.replace(/^https?:\/\//i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase();
  return `reports/${safe || "website"}-${new Date().toISOString().slice(0, 10)}.md`;
}

function normalizeUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}

function safeName(value: string): string {
  return value.replace(/^https?:\/\//i, "").replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "").toLowerCase() || "website";
}
