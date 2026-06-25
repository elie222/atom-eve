#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { atomEveConfigSchema, atomSchema, targetSchema, type AtomEveConfig, type Target } from "@atomeve/schemas";
import { createRegistryItem } from "@atomeve/registry-generator";

interface Args {
  _: string[];
  target?: Target;
  runtime?: string;
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
    if (!agent) throw new Error("Usage: atomeve add <agent>");
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
  const target = args.target ?? detectTarget() ?? "eve";
  const config: AtomEveConfig = {
    $schema: "https://atomeve.dev/schema/atom-eve.json",
    target,
    runtime: args.runtime as AtomEveConfig["runtime"],
    sourceRoot: args.sourceRoot ?? "src",
    registry: "atomeve/agents"
  };
  atomEveConfigSchema.parse(config);
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
  const manifest = atomSchema.parse(JSON.parse(await fs.readFile(manifestPath, "utf8")));
  if (!manifest.targets.includes(target)) throw new Error(`${manifest.name} does not support ${target}`);

  const rootDir = findRegistryRoot(agentDir);
  const item = await createRegistryItem(rootDir, manifest, target);
  for (const file of item.files) {
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
  try {
    const raw = JSON.parse(await fs.readFile(configPath, "utf8"));
    const parsed = atomEveConfigSchema.parse(raw);
    return {
      ...parsed,
      target: args.target ?? parsed.target,
      runtime: (args.runtime as AtomEveConfig["runtime"]) ?? parsed.runtime,
      sourceRoot: args.sourceRoot ?? parsed.sourceRoot
    };
  } catch {
    const target = args.target ?? detectTarget() ?? "eve";
    const config: AtomEveConfig = {
      $schema: "https://atomeve.dev/schema/atom-eve.json",
      target,
      runtime: args.runtime as AtomEveConfig["runtime"],
      sourceRoot: args.sourceRoot ?? "src",
      registry: "atomeve/agents"
    };
    atomEveConfigSchema.parse(config);
    await fs.writeFile(configPath, `${JSON.stringify(config, null, 2)}\n`);
    console.log(`Created ${configPath}`);
    return config;
  }
}

function parseArgs(argv: string[]): Args {
  const args: Args = { _: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i]!;
    if (value === "--target") {
      args.target = targetSchema.parse(argv[++i]);
    } else if (value === "--runtime") {
      args.runtime = argv[++i];
    } else if (value === "--source-root") {
      args.sourceRoot = argv[++i];
    } else {
      args._.push(value);
    }
  }
  return args;
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
  console.log(`atomeve

Commands:
  atomeve init [--target eve|flue] [--runtime node|cloudflare|vercel]
  atomeve add <agent> [--target eve|flue] [--runtime node|cloudflare|vercel]
  atomeve add ./registry/<agent> --target eve|flue
  atomeve list
`);
}
