import { spawn } from "node:child_process";

export interface AgentBrowserInput {
  args: string[];
  sessionName?: string;
  allowedDomains?: string[];
  maxOutputChars?: number;
}

export interface AgentBrowserResult {
  ok: boolean;
  command: string[];
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export async function runAgentBrowser(input: AgentBrowserInput): Promise<AgentBrowserResult> {
  const command = process.env.AGENT_BROWSER_BIN ?? "agent-browser";
  const args = [
    ...(input.sessionName ? ["--session-name", input.sessionName] : []),
    ...input.args,
  ];
  const result = await run(command, args, {
    AGENT_BROWSER_ALLOWED_DOMAINS: input.allowedDomains?.join(","),
    AGENT_BROWSER_CONTENT_BOUNDARIES: "1",
  });
  const max = input.maxOutputChars ?? 12000;

  return {
    ...result,
    stdout: result.stdout.slice(0, max),
    stderr: result.stderr.slice(0, max),
  };
}

async function run(command: string, args: string[], env: Record<string, string | undefined>): Promise<AgentBrowserResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: { ...process.env, ...withoutUndefined(env) },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += String(chunk);
    });
    child.stderr.on("data", (chunk) => {
      stderr += String(chunk);
    });
    child.on("error", (error) => {
      resolve({
        ok: false,
        command: [command, ...args],
        stdout,
        stderr: error.message,
        exitCode: null,
      });
    });
    child.on("close", (code) => {
      resolve({
        ok: code === 0,
        command: [command, ...args],
        stdout,
        stderr,
        exitCode: code,
      });
    });
  });
}

function withoutUndefined(values: Record<string, string | undefined>): Record<string, string> {
  return Object.fromEntries(Object.entries(values).filter((entry): entry is [string, string] => entry[1] !== undefined));
}
