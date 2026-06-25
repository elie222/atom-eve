import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";

export interface BrowserAuditResult {
  notes: string[];
  screenshots: string[];
}

export async function runAgentBrowserAudit(url: string, screenshotDir = "reports/assets"): Promise<BrowserAuditResult> {
  const available = await commandSucceeds("agent-browser", ["--help"]);
  if (!available) {
    return {
      notes: ["agent-browser CLI was not found. Install it to enable screenshots and interactive checks."],
      screenshots: []
    };
  }

  await mkdir(screenshotDir, { recursive: true });
  const commands = [
    ["open", normalizeUrl(url)],
    ["wait", "--load", "networkidle"],
    ["screenshot", "--full", "--screenshot-dir", screenshotDir]
  ];

  const notes: string[] = [];
  for (const args of commands) {
    const result = await run("agent-browser", args);
    if (result.trim()) notes.push(result.trim().slice(0, 1000));
  }

  return {
    notes,
    screenshots: [screenshotDir]
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

function normalizeUrl(value: string): string {
  if (/^https?:\/\//i.test(value)) return value;
  return `https://${value}`;
}
