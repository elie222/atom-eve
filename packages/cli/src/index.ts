#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import type { Target } from "@atom-eve/install-map";
import { printProjectBanner } from "./banner.js";
import {
  installLocalAgent,
  installRemoteAgent,
  installStandaloneEveOverlays,
  normalizeRemoteAgentName,
  rejectExternalTemplate,
  rejectFlueDelivery,
  runInstall
} from "./install.js";
import { fetchGitHubJson } from "./github.js";
import { readJsonFile, readJsonFileSync } from "./json.js";
import { buildConfig, isHelpFlag, parseDelivery, parseRuntime, parseTarget, validateConfig, validateManifest } from "./manifest.js";
import { printNextSteps } from "./next-steps.js";
import { cwd, findRegistryRoot, findUp } from "./paths.js";
import { scaffoldProject, writeConfig, writeIfMissingAt } from "./scaffold.js";
import { dim } from "./style.js";
import { flushTelemetry } from "./telemetry.js";
import type { Args, AtomEveConfig, CliTarget } from "./types.js";

const EVE_INIT_AGENT_MARKER = "atom-eve";

main()
  .then(() => flushTelemetry())
  .catch(async (error) => {
    console.error(error instanceof Error ? error.message : error);
    await flushTelemetry();
    process.exit(1);
  });

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args._[0];

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printHelp();
    return;
  }

  if (command === "init") {
    rejectInstallOptions(command, args);
    if (isHelpFlag(args._[1])) {
      printHelp();
      return;
    }
    if (args.workspace) {
      await initWorkspace(args);
    } else {
      await init(args);
    }
    return;
  }

  if (command === "create" || command === "new") {
    if (isHelpFlag(args._[1])) {
      printHelp();
      return;
    }
    await create(args);
    return;
  }

  if (command === "add") {
    const agent = args._[1];
    if (!agent || isHelpFlag(agent)) {
      printAddHelp();
      return;
    }
    await add(agent, args);
    return;
  }

  if (command === "list") {
    rejectInstallOptions(command, args);
    await list();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function init(args: Args) {
  const target = await resolveTarget(args);
  printProjectBanner();
  await writeConfig(cwd, buildConfig(target, args));
  await scaffoldProject(target);
}

async function initWorkspace(args: Args) {
  const name = args._[1];
  const baseDir = name ? path.join(cwd, name) : cwd;
  await fs.mkdir(path.join(baseDir, "agents"), { recursive: true });

  await writeIfMissingAt(
    path.join(baseDir, "package.json"),
    `${JSON.stringify(
      {
        name: path.basename(baseDir),
        private: true,
        packageManager: "pnpm@10.26.2"
      },
      null,
      2
    )}\n`
  );

  await writeIfMissingAt(path.join(baseDir, "pnpm-workspace.yaml"), 'packages:\n  - "agents/*"\n');

  const where = name ? `cd ${name} && ` : "";
  console.log("Workspace ready. Add an agent app under agents/:");
  console.log(`  ${where}npx atom-eve create my-agent --agent website-qa`);
  console.log("Each agents/<name> folder is a standalone app and maps to its own deploy (e.g. one Vercel project).");
}

// Delegates scaffolding to eve's own CLI, the source of truth for project shape and deps.
async function create(args: Args) {
  const name = args._[1];
  if (!name) throw new Error("Usage: atom-eve create <name> [--agent <agent>]");
  const target = resolveCreateTarget(args);
  const baseDir = resolveCreateBaseDir();
  const appDir = path.join(baseDir, name);

  if (args.agent) {
    await rejectExternalAgentBeforeScaffold(args.agent, args);
  }

  printProjectBanner();

  // eve init creates the <name> directory itself, so scaffold from baseDir.
  runEveInitOrThrow(name, baseDir);

  await writeConfig(appDir, buildConfig(target, args));

  const appCd = path.relative(cwd, appDir) || name;

  if (args.agent) {
    // Re-invoke this CLI inside the new app so the agent installs against its config
    // (add() operates on the module-global cwd, which is fixed at process load).
    const addArgs = [process.argv[1]!, "add", args.agent, "--target", target];
    if (args.deliver) addArgs.push("--deliver", args.deliver);
    if (args.slack === false) addArgs.push("--no-slack");
    if (args.noInstall) addArgs.push("--no-install");
    // The child `add` owns the post-install summary (it has the manifest). Hand it the
    // cd path via env so it prints one unified "Next steps" block for the whole create.
    runOrThrow(process.execPath, addArgs, appDir, `Installing agent: ${args.agent}`, { ATOM_EVE_CREATE_CD: appCd });
    return;
  }

  await installStandaloneEveOverlays(appDir, name, args);
  runInstall(appDir, { noInstall: args.noInstall });
  printNextSteps({ appDir: appCd, vercel: true, suggestAdd: true, slack: args.slack !== false, dev: "npx eve dev" });
}

function resolveCreateTarget(args: Args): Target {
  const target = args.target ?? "eve";
  if (target !== "eve") throw new Error("atom-eve create currently supports only the eve target.");
  return target;
}

function resolveCreateBaseDir(): string {
  const workspaceFile = path.join(cwd, "pnpm-workspace.yaml");
  if (!fsSync.existsSync(workspaceFile)) return cwd;
  if (!/agents\/\*/.test(fsSync.readFileSync(workspaceFile, "utf8"))) return cwd;
  const agentsDir = path.join(cwd, "agents");
  fsSync.mkdirSync(agentsDir, { recursive: true });
  return agentsDir;
}

async function add(agent: string, args: Args) {
  rejectFlueDelivery(args.target, args.deliver);
  await rejectExternalAgentBeforeScaffold(agent, args);
  const needsProjectScaffold = !fsSync.existsSync(path.join(cwd, "package.json"));
  if (needsProjectScaffold) printProjectBanner();
  const config = await readOrCreateConfig(args);
  if (needsProjectScaffold) await scaffoldProject(config.target);
  rejectFlueDelivery(config.target, args.deliver);

  if (agent.startsWith(".") || agent.startsWith("/")) {
    await installLocalAgent(path.resolve(cwd, agent), config, args);
    return;
  }

  await installRemoteAgent(normalizeRemoteAgentName(agent, config.target), config, args);
}

async function rejectExternalAgentBeforeScaffold(agent: string, args: Args): Promise<void> {
  if (agent.startsWith(".") || agent.startsWith("/")) {
    const agentDir = path.resolve(cwd, agent);
    const manifestPath = path.join(agentDir, "atom.json");
    if (!fsSync.existsSync(manifestPath)) return;
    const rootDir = findRegistryRoot(agentDir);
    const manifest = validateManifest(await readJsonFile(manifestPath), path.relative(rootDir, agentDir));
    rejectExternalTemplate(manifest);
    return;
  }

  const config = readConfigIfExists(args);
  const target = config.target;
  const repoPath = `registry/${normalizeRemoteAgentName(agent, target)}`;
  const manifest = validateManifest(await fetchGitHubJson(config, `${repoPath}/atom.json`), repoPath);
  rejectExternalTemplate(manifest);
}

function readConfigIfExists(args: Args): AtomEveConfig {
  const configPath = path.join(cwd, "atom-eve.json");
  if (fsSync.existsSync(configPath)) {
    const raw = readJsonFileSync(configPath);
    return applyConfigArgOverrides(validateConfig(raw), args);
  }
  return buildConfig(args.target ?? "eve", args);
}

async function list() {
  const localIndex = path.join(findUp(cwd, "public") ?? cwd, "index.json");
  try {
    const raw = (await readJsonFile(localIndex)) as {
      items: Array<{ name: string; title: string; targets: string[]; source?: { type: string } }>;
    };
    for (const item of raw.items) {
      const kind = item.source?.type === "external-template" ? "external" : item.targets.join(",");
      console.log(`${item.name}\t${kind}\t${item.title}`);
    }
  } catch {
    console.log("Agent list is available at atomeve.dev");
  }
}

async function readOrCreateConfig(args: Args): Promise<AtomEveConfig> {
  const configPath = path.join(cwd, "atom-eve.json");
  if (fsSync.existsSync(configPath)) {
    const raw = await readJsonFile(configPath);
    return applyConfigArgOverrides(validateConfig(raw), args);
  }

  const target = await resolveTarget(args);
  const config = buildConfig(target, args);
  await writeConfig(cwd, config);
  return config;
}

function applyConfigArgOverrides(config: AtomEveConfig, args: Args): AtomEveConfig {
  return {
    ...config,
    target: args.target ?? config.target,
    runtime: args.runtime ?? config.runtime,
    sourceRoot: args.sourceRoot ?? config.sourceRoot
  };
}

function rejectInstallOptions(command: string, args: Args) {
  if (args.deliver) {
    throw new Error(`--deliver is supported only for atom-eve create and atom-eve add, not ${command}.`);
  }
}

function runOrThrow(command: string, args: string[], cwdDir: string, label: string, env?: Record<string, string>) {
  console.log(label);
  const result = spawnSync(command, args, {
    cwd: cwdDir,
    stdio: "inherit",
    shell: false,
    env: env ? { ...process.env, ...env } : process.env
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function runEveInitOrThrow(name: string, baseDir: string) {
  console.log(`Scaffolding Eve project with eve init: ${name}`);
  const result = spawnSync("npx", ["eve@latest", "init", name], {
    cwd: baseDir,
    env: { ...process.env, AI_AGENT: process.env.AI_AGENT?.trim() ? process.env.AI_AGENT : EVE_INIT_AGENT_MARKER },
    encoding: "utf8",
    maxBuffer: 10 * 1024 * 1024,
    shell: false
  });

  printEveInitOutput(result.stdout);
  printEveInitOutput(result.stderr, "stderr");

  if (result.status !== 0) {
    if (result.error) throw result.error;
    throw new Error(`npx eve@latest init ${name} failed with exit code ${result.status ?? "unknown"}`);
  }
}

function printEveInitOutput(output: string | Buffer | null | undefined, stream: "stdout" | "stderr" = "stdout") {
  if (!output) return;
  const text = String(output);
  const handoffStart = text.indexOf("\n# Build this eve agent with the user");
  const visible = handoffStart === -1 ? text : text.slice(0, handoffStart);
  if (!visible.trim()) return;
  const target = stream === "stderr" ? process.stderr : process.stdout;
  target.write(visible.endsWith("\n") ? visible : `${visible}\n`);
}

function parseArgs(argv: string[]): Args {
  const args: Args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i]!;
    if (value === "--target") {
      args.target = parseTarget(argv[++i]);
    } else if (value === "--runtime") {
      args.runtime = parseRuntime(argv[++i]);
    } else if (value === "--source-root") {
      args.sourceRoot = argv[++i];
    } else if (value === "--workspace") {
      args.workspace = true;
    } else if (value === "--agent") {
      args.agent = argv[++i];
    } else if (value === "--deliver") {
      args.deliver = parseDelivery(argv[++i]);
    } else if (value === "--no-slack") {
      args.slack = false;
    } else if (value === "--no-install") {
      args.noInstall = true;
    } else {
      args._.push(value);
    }
  }
  return args;
}

async function resolveTarget(args: Args): Promise<CliTarget> {
  if (args.target) return args.target;
  return promptForTarget("eve");
}

async function promptForTarget(defaultTarget: CliTarget): Promise<CliTarget> {
  if (!process.stdin.isTTY || !process.stdout.isTTY || process.env.CI) return defaultTarget;

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question(`Install agents for which target? (eve/Flue) ${dim(`[${defaultTarget}]`)} `);
    const value = answer.trim();
    return value ? parseTarget(value) : defaultTarget;
  } finally {
    rl.close();
  }
}

function printHelp() {
  console.log(`atom-eve

Commands:
  atom-eve create <name> [--agent <agent>] [--no-slack] [--no-install]
                                  Scaffold a full Eve project via the eve CLI,
                                  then optionally install an agent. Recommended.
  atom-eve init --workspace [name]
                                  Scaffold a monorepo root (agents/*) for running many agents.
  atom-eve init [--runtime node|cloudflare|vercel]
                                  Write atom-eve.json (+ minimal fallback scaffold) in an existing project.
  atom-eve init --target flue
                                  Write atom-eve.json for generated Flue installs.
  atom-eve add <agent>
  atom-eve add ./registry/<agent>
  atom-eve add <agent> --no-slack
  atom-eve list

Eve is Vercel-native: run \`vercel link\` and the AI Gateway authenticates via
VERCEL_OIDC_TOKEN — no model API key needed. Provider auth is configured per agent:
use Vercel Connect or a Vercel integration when available, otherwise set the required
project env vars.

Slack is Eve-only. Every eve install adds a bidirectional Slack channel by default;
pass \`--no-slack\` to opt out. Add \`--deliver slack\` to also post an agent's
scheduled report to SLACK_CHANNEL_ID.

Dependencies install automatically after scaffolding; pass \`--no-install\` to skip.
`);
}

function printAddHelp() {
  console.log(`atom-eve add

Usage:
  atom-eve add <agent> [--no-slack]
  atom-eve add ./registry/<agent> [--no-slack]
  atom-eve add <agent> --target flue   # generate the flue version + FLUE.md

A Slack channel is on by default for eve installs; pass --no-slack to opt out.
Add --deliver slack to also post the scheduled report to Slack.

Examples:
  atom-eve add stripe-pulse
  atom-eve add seo-audit
  atom-eve add seo-audit --no-slack
  atom-eve add stripe-pulse --target flue
`);
}
