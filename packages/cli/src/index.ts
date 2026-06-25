#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";

type Target = "eve" | "flue";
type Runtime = "vercel" | "node" | "cloudflare";

interface AtomEveConfig {
  $schema?: string;
  target: Target;
  runtime?: Runtime;
  sourceRoot: string;
  registry: string;
}

interface AtomManifest {
  name: string;
  targets: Target[];
  repoPath: string;
}

interface InstallFile {
  target: string;
  content: string;
}

interface Args {
  _: string[];
  target?: Target;
  runtime?: Runtime;
  sourceRoot?: string;
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
    await init(args);
    return;
  }

  if (command === "add") {
    const agent = args._[1];
    if (!agent) throw new Error("Usage: atom-eve add <agent>");
    await add(agent, args);
    return;
  }

  if (command === "list") {
    await list();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

async function init(args: Args) {
  const target = await resolveTarget(args);
  const config: AtomEveConfig = {
    $schema: "https://atomeve.dev/schema/atom-eve.json",
    target,
    runtime: args.runtime,
    sourceRoot: args.sourceRoot ?? "src",
    registry: "elie222/atom-eve"
  };
  validateConfig(config);
  const outPath = path.join(cwd, "atom-eve.json");
  await fs.writeFile(outPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Created ${outPath}`);
}

async function add(agent: string, args: Args) {
  const config = await readOrCreateConfig(args);
  const target = args.target ?? config.target;

  if (agent.startsWith(".") || agent.startsWith("/")) {
    await installLocalAgent(path.resolve(cwd, agent), target, config);
    return;
  }

  const item = `${config.registry}/${target}/${agent}`;
  const result = spawnSync("npx", ["shadcn@latest", "add", item], {
    cwd,
    stdio: "inherit",
    shell: false
  });

  if (result.status !== 0) {
    throw new Error(`shadcn add failed for ${item}`);
  }
}

async function installLocalAgent(agentDir: string, target: Target, config: AtomEveConfig) {
  const manifestPath = path.join(agentDir, "atom.json");
  const rootDir = findRegistryRoot(agentDir);
  const manifest = validateManifest(JSON.parse(await fs.readFile(manifestPath, "utf8")), path.relative(rootDir, agentDir));
  if (!manifest.targets.includes(target)) throw new Error(`${manifest.name} does not support ${target}`);

  const files = await mapFiles(rootDir, manifest, target);
  for (const file of files) {
    const destination = resolveInstallTarget(file.target, config);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, file.content);
    console.log(`installed ${path.relative(cwd, destination)}`);
  }
}

function resolveInstallTarget(target: string, config: AtomEveConfig): string {
  let normalized = target.replace(/^~\//, "");
  if (config.target === "flue" && config.sourceRoot !== "src") {
    normalized = normalized.replace(/^src\//, `${config.sourceRoot}/`);
  }
  return path.join(cwd, normalized);
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
  const config: AtomEveConfig = {
    $schema: "https://atomeve.dev/schema/atom-eve.json",
    target,
    runtime: args.runtime,
    sourceRoot: args.sourceRoot ?? "src",
    registry: "elie222/atom-eve"
  };
  validateConfig(config);
  await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Created ${configPath}`);
  return config;
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
    } else {
      args._.push(value);
    }
  }
  return args;
}

async function resolveTarget(args: Args): Promise<Target> {
  if (args.target) return args.target;
  const detected = detectTarget();
  if (detected) return detected;
  return promptForTarget();
}

async function promptForTarget(): Promise<Target> {
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    throw new Error("Could not detect project target. Re-run with --target eve or --target flue.");
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout });
  try {
    const answer = await rl.question("Install agents for which target? (eve/flue) ");
    return parseTarget(answer.trim().toLowerCase());
  } finally {
    rl.close();
  }
}

async function mapFiles(rootDir: string, manifest: AtomManifest, target: Target): Promise<InstallFile[]> {
  const files: InstallFile[] = [];
  const add = async (source: string, destination: string) => {
    const absSource = path.join(rootDir, manifest.repoPath, source);
    files.push({
      target: destination,
      content: await fs.readFile(absSource, "utf8")
    });
  };

  if (target === "eve") {
    const base = `~/agent/subagents/${manifest.name}`;
    const instructions = await optionalFile(rootDir, manifest, "shared/instructions.md");
    if (instructions) await add(instructions, `${base}/instructions.md`);
    for (const skill of await discoverFiles(rootDir, manifest, "shared/skills")) await add(skill, `${base}/skills/${path.basename(skill)}`);
    for (const lib of await discoverFiles(rootDir, manifest, "shared/lib")) await add(lib, `${base}/lib/${path.basename(lib)}`);
    await add(await requiredFile(rootDir, manifest, "targets/eve/agent.ts"), `${base}/agent.ts`);
    await addTree(rootDir, manifest, "targets/eve/tools", `${base}/tools`, add);
    await addTree(rootDir, manifest, "targets/eve/connections", `${base}/connections`, add);
    await addTree(rootDir, manifest, "targets/eve/sandbox", `${base}/sandbox`, add);
    await addTree(rootDir, manifest, "targets/eve/schedules", "~/agent/schedules", async (source, destination) => {
      const ext = path.extname(destination);
      const stem = destination.slice(0, -ext.length);
      await add(source, `${stem.replace(/\/([^/]+)$/, `/${manifest.name}-$1`)}${ext}`);
    });
    return files;
  }

  const sourceRoot = "src";
  await add(await requiredFile(rootDir, manifest, "targets/flue/agent.ts"), `~/${sourceRoot}/agents/${manifest.name}.ts`);
  for (const skill of await discoverFiles(rootDir, manifest, "shared/skills")) {
    await add(skill, `~/${sourceRoot}/skills/${manifest.name}-${path.basename(skill, path.extname(skill))}/SKILL.md`);
  }
  for (const lib of await discoverFiles(rootDir, manifest, "shared/lib")) {
    await add(lib, `~/${sourceRoot}/lib/agents/${manifest.name}/${path.basename(lib)}`);
  }
  await addTree(rootDir, manifest, "targets/flue/tools", `~/${sourceRoot}/tools/${manifest.name}`, add);
  await addTree(rootDir, manifest, "targets/flue/workflows", `~/${sourceRoot}/workflows`, async (source, destination) => {
    const ext = path.extname(destination);
    const stem = destination.slice(0, -ext.length);
    await add(source, `${stem.replace(/\/([^/]+)$/, `/${manifest.name}-$1`)}${ext}`);
  });
  return files;
}

async function optionalFile(rootDir: string, manifest: AtomManifest, source: string): Promise<string | undefined> {
  const abs = path.join(rootDir, manifest.repoPath, source);
  try {
    const stat = await fs.stat(abs);
    return stat.isFile() ? source : undefined;
  } catch {
    return undefined;
  }
}

async function requiredFile(rootDir: string, manifest: AtomManifest, source: string): Promise<string> {
  const found = await optionalFile(rootDir, manifest, source);
  if (!found) throw new Error(`${manifest.name} is missing ${source}`);
  return found;
}

async function discoverFiles(rootDir: string, manifest: AtomManifest, sourceDir: string): Promise<string[]> {
  const abs = path.join(rootDir, manifest.repoPath, sourceDir);
  const files = await walk(abs).catch(() => []);
  return files
    .map((file) => path.relative(path.join(rootDir, manifest.repoPath), file))
    .sort((a, b) => a.localeCompare(b));
}

async function addTree(
  rootDir: string,
  manifest: AtomManifest,
  sourceDir: string,
  destinationDir: string,
  add: (source: string, destination: string) => Promise<void>
) {
  const abs = path.join(rootDir, manifest.repoPath, sourceDir);
  const entries = await walk(abs).catch(() => []);
  for (const file of entries) {
    const rel = path.relative(path.join(rootDir, manifest.repoPath), file);
    const relInside = path.relative(abs, file);
    await add(rel, `${destinationDir}/${relInside}`);
  }
}

async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}

function parseTarget(value: unknown): Target {
  if (value === "eve" || value === "flue") return value;
  throw new Error(`Invalid target: ${String(value)}. Expected eve or flue.`);
}

function parseRuntime(value: unknown): Runtime {
  if (value === "vercel" || value === "node" || value === "cloudflare") return value;
  throw new Error(`Invalid runtime: ${String(value)}. Expected vercel, node, or cloudflare.`);
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
  const targets = Array.isArray(record.targets) ? record.targets.map(parseTarget) : [];
  if (!targets.length) throw new Error("atom.json must declare at least one target");
  return {
    name: record.name,
    repoPath,
    targets
  };
}

function detectTarget(): Target | undefined {
  try {
    const names = new Set(requireLikeReadDir(cwd));
    if (names.has("agent")) return "eve";
    if (names.has("flue.config.ts") || names.has("flue.config.js")) return "flue";
  } catch {
    return undefined;
  }
  return undefined;
}

function requireLikeReadDir(dir: string): string[] {
  return fsSync.readdirSync(dir);
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

function printHelp() {
  console.log(`atom-eve

Commands:
  atom-eve init [--target eve|flue] [--runtime node|cloudflare|vercel]
  atom-eve add <agent> [--target eve|flue] [--runtime node|cloudflare|vercel]
  atom-eve add ./registry/<agent> --target eve|flue
  atom-eve list
`);
}
