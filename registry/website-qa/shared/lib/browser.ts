import { spawn } from "node:child_process";
import { z } from "zod";

export const agentBrowserCommandSchema = z.array(z.string()).min(1);

export const agentBrowserInputSchema = z.object({
  args: agentBrowserCommandSchema.optional().describe('agent-browser arguments for one command, for example ["open", "https://example.com"] or ["snapshot", "-i"].'),
  commands: z
    .array(agentBrowserCommandSchema)
    .optional()
    .describe(
      'Multiple agent-browser commands to run in one browser session, for example [["open", "https://example.com"], ["wait", "2000"], ["snapshot", "-i"], ["close"]]. Use this for QA flows.',
    ),
  sessionName: z.string().optional().describe("Optional persistent browser session name for this QA run."),
  allowedDomains: z.array(z.string()).optional().describe("Optional domain allowlist, for example ['example.com', '*.example.com']."),
  maxOutputChars: z.number().int().positive().optional().describe("Maximum stdout/stderr characters to return."),
}).refine((input) => Boolean(input.args?.length) !== Boolean(input.commands?.length), {
  message: "Provide either args for one command or commands for a multi-step flow, not both.",
});

export type AgentBrowserInput = z.infer<typeof agentBrowserInputSchema>;

export interface AgentBrowserResult {
  ok: boolean;
  command: string[];
  stdout: string;
  stderr: string;
  exitCode: number | null;
  results?: AgentBrowserResult[];
}

interface AgentBrowserCommandResult {
  command: string;
  exitCode: number;
  stdout: string;
  stderr: string;
}

interface VercelSandboxSession {
  stop(): Promise<void>;
}

interface VercelSandboxModule {
  createAgentBrowserSandbox(options: Record<string, unknown>): Promise<VercelSandboxSession>;
  runAgentBrowserCommand(
    sandbox: VercelSandboxSession,
    args: string[],
    options: Record<string, unknown>,
  ): Promise<AgentBrowserCommandResult>;
}

const sandboxSessions = new Map<string, Promise<VercelSandboxSession>>();

export async function runAgentBrowser(input: AgentBrowserInput): Promise<AgentBrowserResult> {
  if (input.commands?.length) {
    return runAgentBrowserSequence(input);
  }
  if (!input.args?.length) {
    return {
      ok: false,
      command: ["agent-browser"],
      stdout: "",
      stderr: "Provide either args for one command or commands for a multi-step browser flow.",
      exitCode: null,
    };
  }

  if (shouldUseVercelSandbox()) {
    return runAgentBrowserInSandbox(input, input.args);
  }

  const command = process.env.AGENT_BROWSER_BIN ?? "agent-browser";
  const result = await run(command, buildArgv(input, input.args, true));
  return trimResult(result, input.maxOutputChars ?? 12000);
}

async function runAgentBrowserSequence(input: AgentBrowserInput): Promise<AgentBrowserResult> {
  const max = input.maxOutputChars ?? 12000;
  const commands = input.commands ?? [];

  if (shouldUseVercelSandbox()) {
    const sessionName = input.sessionName ?? "website-qa";
    const sandbox = await getSandbox(sessionName);
    const results = [];

    for (const commandArgs of commands) {
      results.push(await runAgentBrowserInSandbox(input, commandArgs, sandbox));
    }

    return aggregateResults(results, max);
  }

  const command = process.env.AGENT_BROWSER_BIN ?? "agent-browser";
  const results = [];

  for (const commandArgs of commands) {
    const result = await run(command, buildArgv(input, commandArgs, true));
    results.push(trimResult(result, max));
  }

  return aggregateResults(results, max);
}

async function runAgentBrowserInSandbox(
  input: AgentBrowserInput,
  commandArgs: string[],
  existingSandbox?: VercelSandboxSession,
): Promise<AgentBrowserResult> {
  const sessionName = input.sessionName ?? "website-qa";
  const args = buildArgv(input, commandArgs, false);
  const max = input.maxOutputChars ?? 12000;

  try {
    const mod = await loadVercelSandboxModule();
    const sandbox = existingSandbox ?? (await getSandbox(sessionName));
    const result = await mod.runAgentBrowserCommand(sandbox, args, {
      json: false,
      stepLabel: `agent-browser ${commandArgs.join(" ")}`,
    });

    if (commandArgs[0] === "close") {
      await stopSandbox(sessionName);
    }

    return normalizeCommandResult(result, max);
  } catch (error) {
    return normalizeCommandError(error, ["agent-browser", ...args], max);
  }
}

function buildArgv(input: AgentBrowserInput, commandArgs: string[], includeSessionName: boolean): string[] {
  return [
    ...(includeSessionName && input.sessionName ? ["--session-name", input.sessionName] : []),
    "--content-boundaries",
    ...(input.allowedDomains?.length ? ["--allowed-domains", input.allowedDomains.join(",")] : []),
    ...commandArgs,
  ];
}

async function getSandbox(sessionName: string): Promise<VercelSandboxSession> {
  const existing = sandboxSessions.get(sessionName);
  if (existing) return existing;

  const mod = await loadVercelSandboxModule();
  const created = mod.createAgentBrowserSandbox({
    timeout: 300_000,
  });
  sandboxSessions.set(sessionName, created);
  return created;
}

async function stopSandbox(sessionName: string) {
  const sandbox = await sandboxSessions.get(sessionName);
  sandboxSessions.delete(sessionName);
  await sandbox?.stop();
}

async function loadVercelSandboxModule(): Promise<VercelSandboxModule> {
  try {
    const dynamicImport = new Function("specifier", "return import(specifier)") as (
      specifier: string,
    ) => Promise<VercelSandboxModule>;
    return await dynamicImport("@agent-browser/sandbox/vercel");
  } catch (error) {
    throw new Error(
      `Vercel Sandbox browser runtime is unavailable. Install @agent-browser/sandbox and @vercel/sandbox, then redeploy. ${String(error)}`,
    );
  }
}

function normalizeCommandResult(result: AgentBrowserCommandResult, max: number): AgentBrowserResult {
  return {
    ok: result.exitCode === 0,
    command: result.command.split(" "),
    stdout: result.stdout.slice(0, max),
    stderr: result.stderr.slice(0, max),
    exitCode: result.exitCode,
  };
}

function trimResult(result: AgentBrowserResult, max: number): AgentBrowserResult {
  return {
    ...result,
    stdout: result.stdout.slice(0, max),
    stderr: result.stderr.slice(0, max),
  };
}

function aggregateResults(results: AgentBrowserResult[], max: number): AgentBrowserResult {
  const failed = results.find((result) => !result.ok);
  const stdout = results.map(formatResult).join("\n\n").slice(0, max);
  const stderr = results
    .map((result) => result.stderr)
    .filter(Boolean)
    .join("\n\n")
    .slice(0, max);

  return {
    ok: !failed,
    command: ["agent-browser", "sequence"],
    stdout,
    stderr,
    exitCode: failed?.exitCode ?? 0,
    results,
  };
}

function formatResult(result: AgentBrowserResult): string {
  const output = result.stdout || result.stderr || "(no output)";
  return `$ ${result.command.join(" ")}\n${output}`;
}

function normalizeCommandError(error: unknown, command: string[], max: number): AgentBrowserResult {
  const maybeCommandError = error as Partial<AgentBrowserCommandResult> & { message?: string };
  return {
    ok: false,
    command,
    stdout: String(maybeCommandError.stdout ?? "").slice(0, max),
    stderr: String(maybeCommandError.stderr ?? maybeCommandError.message ?? error).slice(0, max),
    exitCode: typeof maybeCommandError.exitCode === "number" ? maybeCommandError.exitCode : null,
  };
}

function shouldUseVercelSandbox(): boolean {
  if (process.env.AGENT_BROWSER_USE_SANDBOX === "1") return true;
  if (process.env.AGENT_BROWSER_USE_SANDBOX === "0") return false;
  return process.env.VERCEL === "1";
}

async function run(command: string, args: string[]): Promise<AgentBrowserResult> {
  return new Promise((resolve) => {
    const child = spawn(command, args, {
      env: process.env,
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
