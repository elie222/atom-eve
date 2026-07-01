import { spawnSync } from "node:child_process";
import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import {
  createInstallFileSpecs,
  readLocalInstallFiles,
  type ResolvedInstallFileSpec
} from "@atom-eve/install-map";
import { generateFlueAgent, type EveAgentFile } from "@atom-eve/flue-generator";
import { discoverRemoteFiles, fetchGitHubJson, fetchGitHubRaw, remoteFileExists } from "./github.js";
import { validateManifest } from "./manifest.js";
import { printPostInstallNextSteps } from "./next-steps.js";
import { cwd, findRegistryRoot } from "./paths.js";
import { track } from "./telemetry.js";
import type { AtomEveConfig, AtomManifest, CliTarget, InstallOptions } from "./types.js";

const SLACK_CONNECT_DEPENDENCY = "@vercel/connect@^0.2.10";

export function normalizeRemoteAgentName(agent: string, target: CliTarget): string {
  const prefix = `${target}/`;
  return agent.startsWith(prefix) ? agent.slice(prefix.length) : agent;
}

export async function installLocalAgent(agentDir: string, config: AtomEveConfig, options: InstallOptions) {
  const manifestPath = path.join(agentDir, "atom.json");
  const rootDir = findRegistryRoot(agentDir);
  const manifest = validateManifest(JSON.parse(await fs.readFile(manifestPath, "utf8")), path.relative(rootDir, agentDir));

  const files = await readLocalInstallFiles(rootDir, manifest);
  await installAgentFiles(manifest, files, config, options);
}

export async function installRemoteAgent(agent: string, config: AtomEveConfig, options: InstallOptions) {
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

async function installAgentFiles(
  manifest: AtomManifest,
  files: ResolvedInstallFileSpec[],
  config: AtomEveConfig,
  options: InstallOptions
) {
  if (config.target === "flue") {
    await installFlueAgent(manifest, files);
    runInstall(cwd, options);
    trackInstall(manifest, config, options);
    printPostInstallNextSteps(manifest, config, needsSlackChannel(options));
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
  runInstall(cwd, options);
  trackInstall(manifest, config, options);
  printPostInstallNextSteps(manifest, config, needsSlackChannel(options));
}

// Run the package install so the CLI does the step instead of just printing it.
export function runInstall(baseDir: string, options: InstallOptions) {
  if (options.noInstall) return;
  if (!fsSync.existsSync(path.join(baseDir, "package.json"))) return;

  console.log("");
  console.log("Installing dependencies…");
  const result = spawnSync("pnpm", ["install"], { cwd: baseDir, stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.warn("pnpm install did not finish. Run `pnpm install` manually.");
  }
}

function trackInstall(manifest: AtomManifest, config: AtomEveConfig, options: InstallOptions) {
  track({
    event: "install",
    agent: manifest.name,
    target: config.target,
    channel: options.deliver
  });
}

// Install file targets are `~/agent/<rel>`; strip that prefix before codegen.
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

  if (wantsSlackScheduleDelivery(options)) {
    applySlackScheduleDelivery(next);
  }

  return next.sort((a, b) => a.target.localeCompare(b.target));
}

export async function installStandaloneEveOverlays(appDir: string, agentName: string, options: InstallOptions) {
  if (!needsSlackChannel(options)) return;

  const slackPath = path.join(appDir, "agent", "channels", "slack.ts");
  if (fsSync.existsSync(slackPath)) {
    console.log(`Skipped existing ${path.relative(cwd, slackPath)}`);
  } else {
    await fs.mkdir(path.dirname(slackPath), { recursive: true });
    await fs.writeFile(slackPath, slackChannelContent(agentName));
    console.log(`installed ${path.relative(cwd, slackPath)}`);
  }

  await installPackageDependencies([SLACK_CONNECT_DEPENDENCY], appDir);
}

function needsSlackChannel(options: InstallOptions): boolean {
  return options.slack !== false;
}

function wantsSlackScheduleDelivery(options: InstallOptions): boolean {
  return options.deliver === "slack";
}

export function rejectEveOverlaysForFlue(config: AtomEveConfig, options: InstallOptions) {
  if (config.target === "flue" && options.deliver) {
    throw new Error("--deliver is currently supported only for eve installs.");
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

function applySlackScheduleDelivery(files: ResolvedInstallFileSpec[]): void {
  for (const file of files) {
    if (!isScheduleFile(file.target)) continue;
    const nextContent = toSlackDeliverySchedule(file.content);
    if (!nextContent) continue;
    file.content = nextContent;
    console.log(`wired ${file.target.replace(/^~\/agent\//, "agent/")} for scheduled Slack delivery`);
  }
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

// Remote skills are not vendored in the registry. They are declared in atom.json and
// pulled from skills.sh at install time by delegating to the `skills` CLI, which installs
// into agent/skills/. The framework then discovers them as local files.
async function installRemoteSkills(skills: AtomManifest["skills"]) {
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

function splitSkillRef(ref: string): { repo: string; skill?: string } {
  const at = ref.indexOf("@");
  if (at === -1) return { repo: ref };
  return { repo: ref.slice(0, at), skill: ref.slice(at + 1) };
}
