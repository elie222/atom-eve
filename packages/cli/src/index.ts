#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  createInstallFileSpecs,
  readLocalInstallFiles,
  type InstallManifest,
  type ResolvedInstallFileSpec,
  type Target
} from "@atom-eve/install-map";
import { generateFlueAgent, type EveAgentFile } from "@atom-eve/flue-generator";

type Runtime = "vercel" | "node" | "cloudflare";
type Channel = "slack";
type Delivery = "slack";

// Agents are authored only as eve agents. `flue` is a generated install target:
// the CLI reads the eve `agent/` source and codegens a flue `src/**` tree + a
// FLUE.md gap note. The registry schema stays eve-only.
type CliTarget = "eve" | "flue";

interface AtomEveConfig {
  $schema?: string;
  target: CliTarget;
  runtime?: Runtime;
  sourceRoot: string;
  registry: string;
}

interface RemoteSkillRef {
  ref: string;
}

interface AtomManifest extends InstallManifest {
  dependencies: string[];
  targetDependencies: Partial<Record<Target, string[]>>;
  skills: RemoteSkillRef[];
}

interface Args {
  _: string[];
  target?: CliTarget;
  runtime?: Runtime;
  sourceRoot?: string;
  workspace?: boolean;
  agent?: string;
  channel?: Channel;
  deliver?: Delivery;
}

const SLACK_CONNECT_DEPENDENCY = "@vercel/connect@^0.2.10";

interface InstallOptions {
  channel?: Channel;
  deliver?: Delivery;
}

const cwd = process.cwd();

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
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
    if (args.workspace) {
      await initWorkspace(args);
    } else {
      await init(args);
    }
    return;
  }

  if (command === "create" || command === "new") {
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

function buildConfig(target: CliTarget, args: Args): AtomEveConfig {
  return {
    $schema: "https://atomeve.dev/schema/atom-eve.json",
    target,
    runtime: args.runtime,
    sourceRoot: args.sourceRoot ?? "src",
    registry: "elie222/atom-eve"
  };
}

async function writeConfig(dir: string, config: AtomEveConfig) {
  validateConfig(config);
  const outPath = path.join(dir, "atom-eve.json");
  await fs.writeFile(outPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Created ${path.relative(cwd, outPath) || "atom-eve.json"}`);
}

async function init(args: Args) {
  const target = await resolveTarget(args);
  await writeConfig(cwd, buildConfig(target, args));
  await scaffoldProject(target);
}

// Scaffolds the monorepo root for running many agents side by side: one app
// folder per agent under agents/, each its own deploy target. The frameworks
// scaffold the individual apps; this only lays down the workspace shell.
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
  console.log(`  ${where}npx atom-eve create my-agent --target eve --agent website-qa`);
  console.log("Each agents/<name> folder is a standalone app and maps to its own deploy (e.g. one Vercel project).");
}

// Scaffolds a full eve agent app by delegating to eve's own CLI (the source of
// truth for project shape and deps), then drops in atom-eve.json and, optionally,
// an installed agent. Eve is Vercel-native: link it with `vercel link` and the AI
// Gateway authenticates via VERCEL_OIDC_TOKEN — no model API key required.
async function create(args: Args) {
  const name = args._[1];
  if (!name) throw new Error("Usage: atom-eve create <name> [--agent <agent>]");
  const target = resolveCreateTarget(args);
  const appDir = path.join(cwd, name);

  // eve init creates the <name> directory itself, so scaffold from cwd.
  runOrThrow("npx", ["eve@latest", "init", name], cwd, `Scaffolding Eve app with eve init: ${name}`);

  await writeConfig(appDir, buildConfig(target, args));

  if (args.agent) {
    // Re-invoke this CLI inside the new app so the agent installs against its config
    // (add() operates on the module-global cwd, which is fixed at process load).
    const addArgs = [process.argv[1]!, "add", args.agent, "--target", target];
    if (args.channel) addArgs.push("--channel", args.channel);
    if (args.deliver) addArgs.push("--deliver", args.deliver);
    runOrThrow(process.execPath, addArgs, appDir, `Installing agent: ${args.agent}`);
  } else {
    await installStandaloneEveOverlays(appDir, name, args);
  }

  console.log("\nNext steps:");
  console.log(`  cd ${name}`);
  if (!args.agent) console.log("  npx atom-eve add <agent>      # browse https://atomeve.dev");
  console.log("  vercel link                   # connect to a Vercel project");
  console.log("  vercel env pull               # pull VERCEL_OIDC_TOKEN for the AI Gateway (no model key needed)");
  console.log("  # If model calls fail, verify AI Gateway billing/access or set AGENT_MODEL");
  console.log("  npx eve dev");
}

function resolveCreateTarget(args: Args): Target {
  const target = args.target ?? "eve";
  if (target !== "eve") throw new Error("atom-eve create currently supports only --target eve.");
  return target;
}

function rejectInstallOptions(command: string, args: Args) {
  if (args.channel || args.deliver) {
    throw new Error(`--channel and --deliver are supported only for atom-eve create and atom-eve add, not ${command}.`);
  }
}

function rejectExplicitFlueOverlays(args: Args) {
  if (args.target === "flue" && (args.channel || args.deliver)) {
    throw new Error("--channel and --deliver are currently supported only for --target eve.");
  }
}

function runOrThrow(command: string, args: string[], cwdDir: string, label: string) {
  console.log(label);
  const result = spawnSync(command, args, { cwd: cwdDir, stdio: "inherit", shell: false });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status ?? "unknown"}`);
  }
}

async function writeIfMissingAt(filePath: string, content: string) {
  if (fsSync.existsSync(filePath)) {
    console.log(`Skipped existing ${path.relative(cwd, filePath) || filePath}`);
    return;
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  console.log(`Created ${path.relative(cwd, filePath) || filePath}`);
}

async function add(agent: string, args: Args) {
  rejectExplicitFlueOverlays(args);
  const config = await readOrCreateConfig(args);
  rejectEveOverlaysForFlue(config, args);

  if (agent.startsWith(".") || agent.startsWith("/")) {
    await installLocalAgent(path.resolve(cwd, agent), config, args);
    return;
  }

  await installRemoteAgent(agent, config, args);
}

async function installLocalAgent(agentDir: string, config: AtomEveConfig, options: InstallOptions) {
  const manifestPath = path.join(agentDir, "atom.json");
  const rootDir = findRegistryRoot(agentDir);
  const manifest = validateManifest(JSON.parse(await fs.readFile(manifestPath, "utf8")), path.relative(rootDir, agentDir));

  const files = await readLocalInstallFiles(rootDir, manifest);
  await installAgentFiles(manifest, files, config, options);
}

async function installRemoteAgent(agent: string, config: AtomEveConfig, options: InstallOptions) {
  const repoPath = `registry/${agent}`;
  const manifest = validateManifest(await fetchGitHubJson(config, `${repoPath}/atom.json`), repoPath);

  const specs = await createInstallFileSpecs(manifest, {
    hasFile: async (source) => remoteFileExists(config, `${repoPath}/${source}`),
    discoverFiles: async (sourceDir) => discoverRemoteFiles(config, repoPath, sourceDir)
  });

  const files: ResolvedInstallFileSpec[] = await Promise.all(
    specs.map(async (file) => ({ ...file, content: await fetchGitHubRaw(config, file.path) }))
  );
  await installAgentFiles(manifest, files, config, options);
}

// Eve is a verbatim copy of the agent/ tree; flue is GENERATED from the same
// eve source (src/** + FLUE.md). The registry only ever ships the eve agent.
async function installAgentFiles(
  manifest: AtomManifest,
  files: ResolvedInstallFileSpec[],
  config: AtomEveConfig,
  options: InstallOptions
) {
  if (config.target === "flue") {
    await installFlueAgent(manifest, files);
    return;
  }

  const resolvedFiles = applyEveOverlays(manifest, files, options);

  for (const file of resolvedFiles) {
    const destination = resolveInstallTarget(file.target);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.content);
    console.log(`installed ${path.relative(cwd, destination)}`);
  }

  await installPackageDependencies(dependenciesForInstall(manifest, options));
  await installRemoteSkills(manifest.skills);
}

// Codegen the flue version of an eve agent and write it under the user's flue
// project. The install file targets are `~/agent/<rel>`; recover `<rel>` and run
// the generator. The generated CODE typechecks; FLUE.md lists the runtime wiring.
async function installFlueAgent(manifest: AtomManifest, files: ResolvedInstallFileSpec[]) {
  const eveFiles: EveAgentFile[] = files.map((file) => ({
    path: file.target.replace(/^~\/agent\//, ""),
    content: file.content
  }));

  const { files: generated, flueMd } = generateFlueAgent({
    name: manifest.name,
    files: eveFiles,
    remoteSkills: manifest.skills
  });

  for (const [relPath, content] of Object.entries(generated)) {
    const destination = path.join(cwd, relPath);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, content);
    console.log(`generated ${path.relative(cwd, destination)}`);
  }

  const flueMdPath = path.join(cwd, "src", "agents", `${manifest.name}.FLUE.md`);
  await fs.mkdir(path.dirname(flueMdPath), { recursive: true });
  await fs.writeFile(flueMdPath, flueMd);
  console.log(`generated ${path.relative(cwd, flueMdPath)}`);

  await installPackageDependencies(flueDependencies(generated));
}

// Flue projects always need the runtime; valibot/croner/hono only when a
// workflow + cron app.ts was generated.
function flueDependencies(generated: Record<string, string>): string[] {
  const deps = ["@flue/runtime@1.0.0-beta.7"];
  if (generated["src/app.ts"]) {
    deps.push("croner@^9.1.0", "valibot@^1.1.0", "hono@^4.8.3");
  }
  return deps;
}

async function installPackageDependencies(dependencies: string[], baseDir = cwd) {
  if (!dependencies.length) return;

  const packageJsonPath = path.join(baseDir, "package.json");
  if (!fsSync.existsSync(packageJsonPath)) {
    console.warn(`Could not add ${dependencies.join(", ")} because package.json was not found.`);
    return;
  }

  const raw = JSON.parse(await fs.readFile(packageJsonPath, "utf8")) as Record<string, unknown>;
  const packageJson = raw as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  packageJson.dependencies = packageJson.dependencies ?? {};

  const added: string[] = [];
  for (const dependency of dependencies) {
    const parsed = parseDependencySpec(dependency);
    if (packageJson.dependencies[parsed.name] || packageJson.devDependencies?.[parsed.name]) continue;
    packageJson.dependencies[parsed.name] = parsed.version;
    added.push(`${parsed.name}@${parsed.version}`);
  }

  if (!added.length) return;
  await fs.writeFile(packageJsonPath, `${JSON.stringify(packageJson, null, 2)}\n`);
  console.log(`added dependencies: ${added.join(", ")}`);
}

function dependenciesForManifest(manifest: AtomManifest): string[] {
  return [...new Set([...manifest.dependencies, ...(manifest.targetDependencies.eve ?? [])])].sort();
}

function dependenciesForInstall(manifest: AtomManifest, options: InstallOptions): string[] {
  const dependencies = dependenciesForManifest(manifest);
  if (needsSlackChannel(options) && !dependencies.some((dep) => parseDependencySpec(dep).name === "@vercel/connect")) {
    dependencies.push(SLACK_CONNECT_DEPENDENCY);
  }
  return [...new Set(dependencies)].sort();
}

function applyEveOverlays(
  manifest: AtomManifest,
  files: ResolvedInstallFileSpec[],
  options: InstallOptions
): ResolvedInstallFileSpec[] {
  if (!needsSlackChannel(options)) return files;

  const next = files.map((file) => ({ ...file }));
  const hasSlackChannel = next.some((file) => file.target === "~/agent/channels/slack.ts");
  if (!hasSlackChannel) {
    next.push({
      path: `${manifest.repoPath}/agent/channels/slack.ts`,
      target: "~/agent/channels/slack.ts",
      type: "registry:file",
      content: slackChannelContent(manifest.name)
    });
    console.log("added Slack channel overlay");
  }

  if (options.deliver === "slack") {
    const transformed = applySlackScheduleDelivery(next);
    if (transformed === 0) {
      console.warn("No markdown schedules were converted for Slack delivery. Schedules with custom run() code need manual wiring.");
    }
  }

  return next.sort((a, b) => a.target.localeCompare(b.target));
}

async function installStandaloneEveOverlays(appDir: string, agentName: string, options: InstallOptions) {
  if (!needsSlackChannel(options)) return;

  const slackPath = path.join(appDir, "agent", "channels", "slack.ts");
  if (fsSync.existsSync(slackPath)) {
    console.log(`Skipped existing ${path.relative(cwd, slackPath)}`);
  } else {
    await fs.mkdir(path.dirname(slackPath), { recursive: true });
    await fs.writeFile(slackPath, slackChannelContent(agentName));
    console.log(`installed ${path.relative(cwd, slackPath)}`);
  }

  if (options.deliver === "slack") {
    console.warn("No agent schedules were installed, so --deliver slack has no schedules to wire.");
  }

  await installPackageDependencies([SLACK_CONNECT_DEPENDENCY], appDir);
}

function needsSlackChannel(options: InstallOptions): boolean {
  return options.channel === "slack" || options.deliver === "slack";
}

function rejectEveOverlaysForFlue(config: AtomEveConfig, options: InstallOptions) {
  if (config.target === "flue" && (options.channel || options.deliver)) {
    throw new Error("--channel and --deliver are currently supported only for --target eve.");
  }
}

function slackChannelContent(agentName: string): string {
  const connectionName = JSON.stringify(`slack/${agentName}`);
  return `import { connectSlackCredentials } from "@vercel/connect/eve";
import { slackChannel } from "eve/channels/slack";

export default slackChannel({
  credentials: connectSlackCredentials(${connectionName}),
});
`;
}

function applySlackScheduleDelivery(files: ResolvedInstallFileSpec[]): number {
  let transformed = 0;

  for (const file of files) {
    if (!isScheduleFile(file.target)) continue;
    const nextContent = toSlackDeliverySchedule(file.content);
    if (!nextContent) continue;
    file.content = nextContent;
    transformed += 1;
    console.log(`wired ${file.target.replace(/^~\/agent\//, "agent/")} for scheduled Slack delivery`);
  }

  return transformed;
}

function isScheduleFile(target: string): boolean {
  return target.startsWith("~/agent/schedules/") && target.endsWith(".ts");
}

function toSlackDeliverySchedule(content: string): string | undefined {
  if (!content.includes("defineSchedule") || !content.includes("markdown")) return undefined;
  if (/\brun\s*:|\basync\s+run\s*\(/.test(content)) return undefined;

  const cron = extractPropertyExpression(content, "cron");
  const markdown = extractPropertyExpression(content, "markdown");
  if (!cron || !markdown) return undefined;

  return `import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";

export default defineSchedule({
  cron: ${cron},
  async run({ receive, waitUntil, appAuth }) {
    const channelId = process.env.SLACK_CHANNEL_ID;
    if (!channelId) throw new Error("SLACK_CHANNEL_ID is required for scheduled Slack delivery.");

    waitUntil(
      receive(slack, {
        message: ${markdown},
        target: { channelId },
        auth: appAuth,
      }),
    );
  },
});
`;
}

function extractPropertyExpression(content: string, property: string): string | undefined {
  const match = new RegExp(`\\b${property}\\s*:`).exec(content);
  if (!match || match.index === undefined) return undefined;

  let i = match.index + match[0].length;
  while (/\s/.test(content[i] ?? "")) i += 1;

  const start = i;
  let depth = 0;
  let quote: '"' | "'" | "`" | undefined;
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (; i < content.length; i += 1) {
    const char = content[i]!;
    const next = content[i + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }

    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        i += 1;
      }
      continue;
    }

    if (quote) {
      if (escaped) {
        escaped = false;
      } else if (char === "\\") {
        escaped = true;
      } else if (char === quote) {
        quote = undefined;
      }
      continue;
    }

    if (char === "/" && next === "/") {
      lineComment = true;
      i += 1;
      continue;
    }

    if (char === "/" && next === "*") {
      blockComment = true;
      i += 1;
      continue;
    }

    if (char === '"' || char === "'" || char === "`") {
      quote = char;
      continue;
    }

    if (char === "(" || char === "[" || char === "{") {
      depth += 1;
      continue;
    }

    if (char === ")" || char === "]" || char === "}") {
      if (depth === 0) break;
      depth -= 1;
      continue;
    }

    if (char === "," && depth === 0) break;
  }

  const expression = content.slice(start, i).trim();
  return expression || undefined;
}

function parseDependencySpec(spec: string): { name: string; version: string } {
  const versionAt = spec.startsWith("@") ? spec.indexOf("@", spec.indexOf("/") + 1) : spec.indexOf("@");
  if (versionAt === -1) return { name: spec, version: "latest" };
  return {
    name: spec.slice(0, versionAt),
    version: spec.slice(versionAt + 1) || "latest"
  };
}

function resolveInstallTarget(target: string): string {
  return path.join(cwd, target.replace(/^~\//, ""));
}

async function list() {
  const localIndex = path.join(findUp(cwd, "public") ?? cwd, "index.json");
  try {
    const raw = JSON.parse(await fs.readFile(localIndex, "utf8")) as { items: Array<{ name: string; title: string; targets: string[] }> };
    for (const item of raw.items) {
      console.log(`${item.name}\t${item.targets.join(",")}\t${item.title}`);
    }
  } catch {
    console.log("Agent list is available at https://atomeve.dev");
  }
}

async function readOrCreateConfig(args: Args): Promise<AtomEveConfig> {
  const configPath = path.join(cwd, "atom-eve.json");
  if (fsSync.existsSync(configPath)) {
    const raw = JSON.parse(await fs.readFile(configPath, "utf8"));
    const parsed = validateConfig(raw);
    return {
      ...parsed,
      target: args.target ?? parsed.target,
      runtime: args.runtime ?? parsed.runtime,
      sourceRoot: args.sourceRoot ?? parsed.sourceRoot
    };
  }

  const target = await resolveTarget(args);
  const config = buildConfig(target, args);
  await writeConfig(cwd, config);
  return config;
}

async function scaffoldProject(target: CliTarget) {
  if (target === "flue") {
    await scaffoldFlueProject();
    return;
  }
  if (target !== "eve") return;

  await writeIfMissing(
    "package.json",
    `${JSON.stringify(
      {
        name: path.basename(cwd),
        version: "0.0.0",
        private: true,
        type: "module",
        packageManager: "pnpm@10.26.2",
        scripts: {
          build: "eve build",
          dev: "eve dev",
          start: "eve start",
          typecheck: "tsc"
        },
        dependencies: {
          ai: "^7.0.0",
          eve: "^0.16.2"
        },
        devDependencies: {
          "@types/node": "24.x",
          typescript: "7.0.1-rc"
        },
        engines: {
          node: "24.x"
        }
      },
      null,
      2
    )}\n`
  );

  await writeIfMissing(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          skipLibCheck: true,
          types: ["node"],
          noEmit: true
        },
        include: ["agent/**/*.ts", "evals/**/*.ts"]
      },
      null,
      2
    )}\n`
  );
}

// Flue is a generated target: a `src/**` project on `@flue/runtime`. Mirrors the
// validated reference tsconfig (NodeNext + allowImportingTsExtensions so app.ts
// can import ./workflows/*.ts; the *.md / *.skill.md ambient types ship in the
// package). croner/valibot/hono are added on demand when a workflow is generated.
async function scaffoldFlueProject() {
  await writeIfMissing(
    "package.json",
    `${JSON.stringify(
      {
        name: path.basename(cwd),
        version: "0.0.0",
        private: true,
        type: "module",
        scripts: {
          typecheck: "tsc --noEmit"
        },
        dependencies: {
          "@flue/runtime": "1.0.0-beta.7"
        },
        devDependencies: {
          "@types/node": "24.x",
          typescript: "^5.7.3"
        },
        engines: {
          node: ">=22.19.0"
        }
      },
      null,
      2
    )}\n`
  );

  await writeIfMissing(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          types: ["node"],
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          allowImportingTsExtensions: true,
          noEmit: true,
          resolveJsonModule: true
        },
        include: ["src/**/*.ts"]
      },
      null,
      2
    )}\n`
  );
}

async function writeIfMissing(relativePath: string, content: string) {
  await writeIfMissingAt(path.join(cwd, relativePath), content);
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
    } else if (value === "--channel") {
      args.channel = parseChannel(argv[++i]);
    } else if (value === "--deliver") {
      args.deliver = parseDelivery(argv[++i]);
    } else {
      args._.push(value);
    }
  }
  return args;
}

async function resolveTarget(args: Args): Promise<CliTarget> {
  return args.target ?? "eve";
}

// Registry manifests are authored eve-only; this narrows a parsed CLI target to
// the registry-side `Target` and rejects anything the registry never declares.
function parseManifestTarget(value: unknown): Target {
  const target = parseTarget(value);
  if (target !== "eve") {
    throw new Error(`atom.json declares an unsupported target: ${target}`);
  }
  return target;
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

function parseTarget(value: unknown): CliTarget {
  if (value === "eve" || value === "flue") return value;
  throw new Error(`Invalid target: ${String(value)}. Expected eve or flue.`);
}

function parseRuntime(value: unknown): Runtime {
  if (value === "vercel" || value === "node" || value === "cloudflare") return value;
  throw new Error(`Invalid runtime: ${String(value)}. Expected vercel, node, or cloudflare.`);
}

function parseChannel(value: unknown): Channel {
  if (value === "slack") return value;
  throw new Error(`Invalid channel: ${String(value)}. Expected slack.`);
}

function parseDelivery(value: unknown): Delivery {
  if (value === "slack") return value;
  throw new Error(`Invalid delivery: ${String(value)}. Expected slack.`);
}

function isHelpFlag(value: unknown): boolean {
  return value === "help" || value === "--help" || value === "-h";
}

function validateConfig(value: unknown): AtomEveConfig {
  if (!value || typeof value !== "object") throw new Error("Invalid atom-eve.json");
  const record = value as Record<string, unknown>;
  return {
    $schema: typeof record.$schema === "string" ? record.$schema : undefined,
    target: parseTarget(record.target),
    runtime: record.runtime === undefined ? undefined : parseRuntime(record.runtime),
    sourceRoot: typeof record.sourceRoot === "string" ? record.sourceRoot : "src",
    registry: typeof record.registry === "string" ? record.registry : "elie222/atom-eve"
  };
}

function validateManifest(value: unknown, repoPath: string): AtomManifest {
  if (!value || typeof value !== "object") throw new Error("Invalid atom.json");
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") throw new Error("atom.json is missing name");
  const targets = Array.isArray(record.targets) ? record.targets.map(parseManifestTarget) : [];
  if (!targets.includes("eve")) throw new Error("atom.json must declare the eve target");
  return {
    name: record.name,
    repoPath,
    targets,
    dependencies: parseStringArray(record.dependencies, "dependencies"),
    targetDependencies: parseTargetDependencies(record.targetDependencies),
    skills: parseSkillRefs(record.skills)
  };
}

function parseStringArray(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`atom.json ${field} must be an array`);
  return value.map((entry) => {
    if (typeof entry !== "string" || !entry) throw new Error(`atom.json ${field} must contain strings`);
    return entry;
  });
}

function parseTargetDependencies(value: unknown): Partial<Record<Target, string[]>> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("atom.json targetDependencies must be an object");
  const record = value as Record<string, unknown>;
  return {
    eve: parseStringArray(record.eve, "targetDependencies.eve")
  };
}

function parseSkillRefs(value: unknown): RemoteSkillRef[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("atom.json skills must be an array");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid skill ref");
    const record = entry as Record<string, unknown>;
    if (typeof record.ref !== "string") throw new Error("skill ref is missing 'ref'");
    return { ref: record.ref };
  });
}

// Remote skills are not vendored in the registry. They are declared in atom.json and
// pulled from skills.sh at install time by delegating to the `skills` CLI, which installs
// into agent/skills/. The framework then discovers them as local files.
async function installRemoteSkills(skills: RemoteSkillRef[]) {
  if (!skills.length) return;
  if (process.env.ATOM_EVE_SKIP_REMOTE_SKILLS) {
    console.log(`Skipping ${skills.length} remote skill(s) (ATOM_EVE_SKIP_REMOTE_SKILLS set).`);
    return;
  }

  for (const skill of skills) {
    const { repo, skill: skillName } = splitSkillRef(skill.ref);
    const args = ["--yes", "skills", "add", repo, "-a", "eve", "--copy", "-y"];
    if (skillName) args.push("-s", skillName);
    const result = spawnSync("npx", args, { cwd, stdio: "inherit", shell: false });
    if (result.status !== 0) {
      console.warn(`Could not install remote skill ${skill.ref}. Install it manually with: npx skills add ${skill.ref}`);
    }
  }
}

// "owner/repo@skill" -> { repo: "owner/repo", skill: "skill" }; the @skill part is optional.
function splitSkillRef(ref: string): { repo: string; skill?: string } {
  const at = ref.indexOf("@");
  if (at === -1) return { repo: ref };
  return { repo: ref.slice(0, at), skill: ref.slice(at + 1) };
}

function findRegistryRoot(agentDir: string): string {
  let current = agentDir;
  while (current !== path.dirname(current)) {
    if (path.basename(path.dirname(current)) === "registry") return path.dirname(path.dirname(current));
    current = path.dirname(current);
  }
  return path.dirname(path.dirname(agentDir));
}

function findUp(start: string, name: string): string | undefined {
  let current = start;
  while (current !== path.dirname(current)) {
    const candidate = path.join(current, name);
    try {
      fsSync.statSync(candidate);
      return candidate;
    } catch {
      current = path.dirname(current);
    }
  }
  return undefined;
}

async function remoteFileExists(config: AtomEveConfig, repoFilePath: string): Promise<boolean> {
  const response = await fetch(gitHubContentsUrl(config, repoFilePath), {
    headers: { accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(5000)
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`Could not read ${repoFilePath} from ${config.registry}: HTTP ${response.status}`);
  const data = (await response.json()) as GitHubContentEntry | GitHubContentEntry[];
  return !Array.isArray(data) && data.type === "file";
}

async function discoverRemoteFiles(config: AtomEveConfig, repoPath: string, sourceDir: string): Promise<string[]> {
  const root = `${repoPath}/${sourceDir}`;
  const response = await fetch(gitHubContentsUrl(config, root), {
    headers: { accept: "application/vnd.github+json" },
    signal: AbortSignal.timeout(5000)
  });
  if (response.status === 404) return [];
  if (!response.ok) throw new Error(`Could not list ${root} from ${config.registry}: HTTP ${response.status}`);

  const data = (await response.json()) as GitHubContentEntry | GitHubContentEntry[];
  if (!Array.isArray(data)) return data.type === "file" ? [toPosixPath(path.posix.relative(repoPath, data.path))] : [];

  const files: string[] = [];
  for (const entry of data) {
    if (entry.type === "file") {
      files.push(toPosixPath(path.posix.relative(repoPath, entry.path)));
    } else if (entry.type === "dir") {
      files.push(...(await discoverRemoteFiles(config, repoPath, path.posix.relative(repoPath, entry.path))));
    }
  }
  return files.sort((a, b) => a.localeCompare(b));
}

async function fetchGitHubJson(config: AtomEveConfig, repoFilePath: string): Promise<unknown> {
  const response = await fetch(rawGitHubUrl(config, repoFilePath), {
    headers: { accept: "application/json" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`Could not fetch ${repoFilePath} from ${config.registry}: HTTP ${response.status}`);
  return response.json();
}

async function fetchGitHubRaw(config: AtomEveConfig, repoFilePath: string): Promise<string> {
  const response = await fetch(rawGitHubUrl(config, repoFilePath), {
    headers: { accept: "text/plain" },
    signal: AbortSignal.timeout(10000)
  });
  if (!response.ok) throw new Error(`Could not fetch ${repoFilePath} from ${config.registry}: HTTP ${response.status}`);
  return response.text();
}

interface GitHubContentEntry {
  path: string;
  type: "file" | "dir" | string;
}

function gitHubContentsUrl(config: AtomEveConfig, repoFilePath: string): string {
  assertGitHubRegistry(config.registry);
  return `https://api.github.com/repos/${config.registry}/contents/${encodeGitHubPath(repoFilePath)}`;
}

function rawGitHubUrl(config: AtomEveConfig, repoFilePath: string): string {
  assertGitHubRegistry(config.registry);
  return `https://raw.githubusercontent.com/${config.registry}/HEAD/${encodeGitHubPath(repoFilePath)}`;
}

function assertGitHubRegistry(registry: string) {
  if (!/^[^/\s]+\/[^/\s]+$/.test(registry)) {
    throw new Error(`Remote installs require a GitHub registry in owner/repo form. Got: ${registry}`);
  }
}

function encodeGitHubPath(repoFilePath: string): string {
  return repoFilePath.split("/").map(encodeURIComponent).join("/");
}

function printHelp() {
  console.log(`atom-eve

Commands:
  atom-eve create <name> [--agent <agent>] [--channel slack] [--deliver slack]
                                  Scaffold a full eve app via the eve CLI,
                                  then optionally install an agent. Recommended.
  atom-eve init --workspace [name]
                                  Scaffold a monorepo root (agents/*) for running many agents.
  atom-eve init [--runtime node|cloudflare|vercel]
                                  Write atom-eve.json (+ minimal fallback scaffold) in an existing project.
  atom-eve add <agent>
  atom-eve add ./registry/<agent>
  atom-eve add <agent> --channel slack
  atom-eve add <agent> --deliver slack
  atom-eve list

Eve is Vercel-native: run \`vercel link\` and the AI Gateway authenticates via
VERCEL_OIDC_TOKEN — no model API key needed. Agent integration secrets (e.g. STRIPE_API_KEY)
are set as Vercel project env vars.

Slack flags are Eve-only. \`--channel slack\` installs a bidirectional Slack channel.
\`--deliver slack\` also rewires markdown schedules to post their final result to
SLACK_CHANNEL_ID.
`);
}

function printAddHelp() {
  console.log(`atom-eve add

Usage:
  atom-eve add <agent> [--channel slack] [--deliver slack]
  atom-eve add ./registry/<agent> [--channel slack] [--deliver slack]
  atom-eve add <agent> --target flue   # generate the flue version + FLUE.md

Examples:
  atom-eve add stripe-pulse
  atom-eve add seo-audit --channel slack
  atom-eve add seo-audit --deliver slack
  atom-eve add stripe-pulse --target flue
`);
}
