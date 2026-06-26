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
  workspace?: boolean;
  agent?: string;
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
    await list();
    return;
  }

  throw new Error(`Unknown command: ${command}`);
}

function buildConfig(target: Target, args: Args): AtomEveConfig {
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

// Scaffolds a full agent app by delegating to the framework's own CLI (the
// source of truth for project shape and deps), then drops in atom-eve.json and,
// optionally, an installed agent. For Eve this means the project is Vercel-native:
// link it with `vercel link` and the AI Gateway authenticates via VERCEL_OIDC_TOKEN
// — no model API key required.
async function create(args: Args) {
  const name = args._[1];
  if (!name) throw new Error("Usage: atom-eve create <name> [--target eve|flue] [--agent <agent>]");
  // create scaffolds a brand-new directory, so there is nothing to detect or prompt for —
  // default to eve (the Vercel-native happy path) instead of routing through resolveTarget.
  const target = args.target ?? "eve";
  const appDir = path.join(cwd, name);

  if (target === "eve") {
    // eve init creates the <name> directory itself, so scaffold from cwd.
    runOrThrow("npx", ["eve@latest", "init", name], cwd, `Scaffolding Eve app with eve init: ${name}`);
  } else {
    // flue init writes into the current directory, so create the app dir first.
    await fs.mkdir(appDir, { recursive: true });
    runOrThrow("npx", ["flue", "init", "--target", args.runtime ?? "node"], appDir, `Scaffolding Flue app with flue init: ${name}`);
  }

  await writeConfig(appDir, buildConfig(target, args));

  if (args.agent) {
    // Re-invoke this CLI inside the new app so the agent installs against its config
    // (add() operates on the module-global cwd, which is fixed at process load).
    const addArgs = [process.argv[1]!, "add", args.agent, "--target", target];
    runOrThrow(process.execPath, addArgs, appDir, `Installing agent: ${args.agent}`);
  }

  console.log("\nNext steps:");
  console.log(`  cd ${name}`);
  if (!args.agent) console.log("  npx atom-eve add <agent>      # browse https://atomeve.dev");
  if (target === "eve") {
    console.log("  vercel link                   # connect to a Vercel project");
    console.log("  vercel env pull               # pull VERCEL_OIDC_TOKEN for the AI Gateway (no model key needed)");
    console.log("  npx eve dev");
  } else {
    console.log("  npx flue run <agent> --input '{ ... }'");
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
  const config = await readOrCreateConfig(args);
  const target = args.target ?? config.target;

  if (agent.startsWith(".") || agent.startsWith("/")) {
    await installLocalAgent(path.resolve(cwd, agent), target, config);
    return;
  }

  await installRemoteAgent(agent, target, config);
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

async function installRemoteAgent(agent: string, target: Target, config: AtomEveConfig) {
  const repoPath = `registry/${agent}`;
  const manifest = validateManifest(await fetchGitHubJson(config, `${repoPath}/atom.json`), repoPath);
  if (!manifest.targets.includes(target)) throw new Error(`${manifest.name} does not support ${target}`);

  const files = await createInstallFileSpecs(manifest, target, {
    hasFile: async (source) => remoteFileExists(config, `${repoPath}/${source}`),
    discoverFiles: async (sourceDir) => discoverRemoteFiles(config, repoPath, sourceDir)
  });

  for (const file of files) {
    const destination = resolveInstallTarget(file.target, config);
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, await fetchGitHubRaw(config, file.path));
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
  const config = buildConfig(target, args);
  await writeConfig(cwd, config);
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
  atom-eve create <name> [--target eve|flue] [--agent <agent>]
                                  Scaffold a full app via the framework CLI (eve/flue),
                                  then optionally install an agent. Recommended.
  atom-eve init --workspace [name]
                                  Scaffold a monorepo root (agents/*) for running many agents.
  atom-eve init [--target eve|flue] [--runtime node|cloudflare|vercel]
                                  Write atom-eve.json (+ minimal fallback scaffold) in an existing project.
  atom-eve add <agent> [--target eve|flue] [--runtime node|cloudflare|vercel]
  atom-eve add ./registry/<agent> --target eve|flue
  atom-eve list

Eve is Vercel-native: run \`vercel link\` and the AI Gateway authenticates via
VERCEL_OIDC_TOKEN — no model API key needed. Agent integration secrets (e.g. STRIPE_SECRET_KEY)
are set as Vercel project env vars. For Flue, set env vars per its docs.
`);
}

function printAddHelp() {
  console.log(`atom-eve add

Usage:
  atom-eve add <agent> [--target eve|flue] [--runtime node|cloudflare|vercel]
  atom-eve add ./registry/<agent> --target eve|flue

Examples:
  atom-eve add website-qa --target eve
  atom-eve add facebook-ads --target flue
`);
}
