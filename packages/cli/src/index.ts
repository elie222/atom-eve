#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline/promises";
import { createInstallFileSpecs, type InstallManifest, type Target } from "@atom-eve/install-map";

type Runtime = "vercel" | "node" | "cloudflare";

interface AtomEveConfig {
  $schema?: string;
  target: Target;
  runtime?: Runtime;
  sourceRoot: string;
  registry: string;
}

interface RemoteSkillRef {
  ref: string;
}

interface AtomManifest extends InstallManifest {
  skills: RemoteSkillRef[];
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
  await scaffoldProject(target);
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
    throw new Error(
      [
        `shadcn add failed for ${item}.`,
        `Make sure ${config.registry} is public and exposes registry.json at the repository root, or install from a local registry checkout:`,
        `  atom-eve add /path/to/atom-eve/registry/${agent} --target ${target}`
      ].join("\n")
    );
  }

  await installRemoteSkills(await remoteSkillsForAgent(agent, config), target);
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

  await installRemoteSkills(manifest.skills, target);
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

async function scaffoldProject(target: Target) {
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
          eve: "^0.14.0"
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

async function writeIfMissing(relativePath: string, content: string) {
  const filePath = path.join(cwd, relativePath);
  if (fsSync.existsSync(filePath)) return;
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  console.log(`Created ${filePath}`);
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
  const specs = await createInstallFileSpecs(manifest, target, {
    hasFile: async (source) => Boolean(await optionalFile(rootDir, manifest, source)),
    discoverFiles: (sourceDir) => discoverFiles(rootDir, manifest, sourceDir)
  });

  return Promise.all(
    specs.map(async (file) => ({
      target: file.target,
      content: await fs.readFile(path.join(rootDir, file.path), "utf8")
    }))
  );
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

async function discoverFiles(rootDir: string, manifest: AtomManifest, sourceDir: string): Promise<string[]> {
  const abs = path.join(rootDir, manifest.repoPath, sourceDir);
  const files = await walk(abs).catch(() => []);
  return files
    .map((file) => toPosixPath(path.relative(path.join(rootDir, manifest.repoPath), file)))
    .sort((a, b) => a.localeCompare(b));
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
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
    targets,
    skills: parseSkillRefs(record.skills)
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
// pulled from skills.sh at install time by delegating to the `skills` CLI, which owns
// auth and per-tool placement: eve installs into agent/skills/, every other target uses
// the universal .agents/skills/ location. The framework then discovers them as local files.
async function installRemoteSkills(skills: RemoteSkillRef[], target: Target) {
  if (!skills.length) return;
  if (process.env.ATOM_EVE_SKIP_REMOTE_SKILLS) {
    console.log(`Skipping ${skills.length} remote skill(s) (ATOM_EVE_SKIP_REMOTE_SKILLS set).`);
    return;
  }

  const agentTarget = target === "eve" ? "eve" : "universal";
  for (const skill of skills) {
    const { repo, skill: skillName } = splitSkillRef(skill.ref);
    const args = ["--yes", "skills", "add", repo, "-a", agentTarget, "--copy", "-y"];
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

// Best-effort lookup of an agent's declared remote skills for the shadcn install path,
// where we never read the local atom.json. Reads it from the GitHub registry instead.
async function remoteSkillsForAgent(agent: string, config: AtomEveConfig): Promise<RemoteSkillRef[]> {
  const url = `https://raw.githubusercontent.com/${config.registry}/HEAD/registry/${agent}/atom.json`;
  try {
    const response = await fetch(url, { headers: { accept: "application/json" }, signal: AbortSignal.timeout(5000) });
    if (!response.ok) return [];
    const data = (await response.json()) as { skills?: unknown };
    return parseSkillRefs(data.skills);
  } catch {
    return [];
  }
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
