import { promises as fs } from "node:fs";
import path from "node:path";

export type Target = "eve" | "flue";

export interface InstallManifest {
  name: string;
  repoPath: string;
  targets: Target[];
}

export interface InstallFileSpec {
  path: string;
  target: string;
  type: "registry:file";
}

export interface ResolvedInstallFileSpec extends InstallFileSpec {
  content: string;
}

export interface InstallSourceReader {
  hasFile(source: string): Promise<boolean>;
  discoverFiles(sourceDir: string): Promise<string[]>;
}

export async function createInstallFileSpecs(
  manifest: InstallManifest,
  target: Target,
  sourceReader: InstallSourceReader
): Promise<InstallFileSpec[]> {
  if (!manifest.targets.includes(target)) {
    throw new Error(`${manifest.name} does not support ${target}`);
  }

  const files: InstallFileSpec[] = [];
  const addPath = (sourcePath: string, destination: string) => {
    files.push({
      path: sourcePath,
      target: destination,
      type: "registry:file"
    });
  };
  const add = (source: string, destination: string) => {
    addPath(`${manifest.repoPath}/${source}`, destination);
  };

  const optionalFile = async (source: string): Promise<string | undefined> =>
    (await sourceReader.hasFile(source)) ? source : undefined;

  const requiredFile = async (source: string): Promise<string> => {
    const found = await optionalFile(source);
    if (!found) throw new Error(`${manifest.name} is missing ${source}`);
    return found;
  };

  const addTree = async (
    sourceDir: string,
    destinationDir: string,
    addFile: (source: string, destination: string) => void = add
  ) => {
    for (const source of await sourceReader.discoverFiles(sourceDir)) {
      const relInside = path.posix.relative(sourceDir, source);
      addFile(source, `${destinationDir}/${relInside}`);
    }
  };

  if (target === "eve") {
    const base = "~/agent";
    const instructions = await optionalFile("shared/instructions.md");
    if (instructions) add(instructions, `${base}/instructions.md`);
    for (const skill of await sourceReader.discoverFiles("shared/skills")) {
      add(skill, `${base}/skills/${path.posix.basename(skill)}`);
    }
    for (const lib of await sourceReader.discoverFiles("shared/lib")) {
      const relInside = path.posix.relative("shared/lib", lib);
      add(lib, `${base}/lib/${relInside}`);
    }
    await addTree("targets/eve/lib", `${base}/lib`);
    add(await requiredFile("targets/eve/agent.ts"), `${base}/agent.ts`);
    await addTree("targets/eve/tools", `${base}/tools`);
    await addTree("targets/eve/connections", `${base}/connections`);
    await addTree("targets/eve/sandbox", `${base}/sandbox`);
    await addTree("targets/eve/schedules", "~/agent/schedules");
    const evalFiles = await sourceReader.discoverFiles("evals/eve");
    if (evalFiles.length > 0 && !evalFiles.includes("evals/eve/evals.config.ts")) {
      addPath("registry/_common/evals/eve/evals.config.ts", "~/evals/evals.config.ts");
    }
    for (const source of evalFiles) {
      const relInside = path.posix.relative("evals/eve", source);
      add(source, `~/evals/${relInside}`);
    }
    return files;
  }

  const sourceRoot = "src";
  add(await requiredFile("targets/flue/agent.ts"), `~/${sourceRoot}/agents/${manifest.name}.ts`);
  for (const skill of await sourceReader.discoverFiles("shared/skills")) {
    const name = path.posix.basename(skill, path.posix.extname(skill));
    add(skill, `~/${sourceRoot}/skills/${manifest.name}-${name}/SKILL.md`);
  }
  for (const lib of await sourceReader.discoverFiles("shared/lib")) {
    const relInside = path.posix.relative("shared/lib", lib);
    add(lib, `~/${sourceRoot}/lib/agents/${manifest.name}/${relInside}`);
  }
  await addTree("targets/flue/lib", `~/${sourceRoot}/lib/agents/${manifest.name}`);
  await addTree("targets/flue/tools", `~/${sourceRoot}/tools/${manifest.name}`);
  await addTree("targets/flue/workflows", `~/${sourceRoot}/workflows`, (source, destination) => {
    const ext = path.posix.extname(destination);
    const stem = destination.slice(0, -ext.length);
    add(source, `${stem.replace(/\/([^/]+)$/, `/${manifest.name}-$1`)}${ext}`);
  });
  return files;
}

function createLocalSourceReader(rootDir: string, manifest: Pick<InstallManifest, "repoPath">): InstallSourceReader {
  return {
    hasFile: async (source) => Boolean(await optionalFile(rootDir, manifest, source)),
    discoverFiles: (sourceDir) => discoverFiles(rootDir, manifest, sourceDir)
  };
}

export async function readLocalInstallFiles(
  rootDir: string,
  manifest: InstallManifest,
  target: Target
): Promise<ResolvedInstallFileSpec[]> {
  const specs = await createInstallFileSpecs(manifest, target, createLocalSourceReader(rootDir, manifest));
  return Promise.all(
    specs.map(async (file) => ({
      ...file,
      content: await fs.readFile(path.join(rootDir, file.path), "utf8")
    }))
  );
}

async function optionalFile(
  rootDir: string,
  manifest: Pick<InstallManifest, "repoPath">,
  source: string
): Promise<string | undefined> {
  const abs = path.join(rootDir, manifest.repoPath, source);
  try {
    const stat = await fs.stat(abs);
    return stat.isFile() ? source : undefined;
  } catch {
    return undefined;
  }
}

async function discoverFiles(rootDir: string, manifest: Pick<InstallManifest, "repoPath">, sourceDir: string): Promise<string[]> {
  const abs = path.join(rootDir, manifest.repoPath, sourceDir);
  const files = await walk(abs).catch(() => []);
  return files
    .map((file) => toPosixPath(path.relative(path.join(rootDir, manifest.repoPath), file)))
    .sort((a, b) => a.localeCompare(b));
}

function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

export async function walk(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}
