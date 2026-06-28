import { promises as fs } from "node:fs";
import path from "node:path";

export type Target = "eve";

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
  sourceReader: InstallSourceReader
): Promise<InstallFileSpec[]> {
  const files: InstallFileSpec[] = [];
  for (const source of await sourceReader.discoverFiles("agent")) {
    const relInside = path.posix.relative("agent", source);
    files.push({
      path: `${manifest.repoPath}/${source}`,
      target: `~/agent/${relInside}`,
      type: "registry:file"
    });
  }
  if (files.length === 0) throw new Error(`${manifest.name} is missing agent/`);
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
  manifest: InstallManifest
): Promise<ResolvedInstallFileSpec[]> {
  const specs = await createInstallFileSpecs(manifest, createLocalSourceReader(rootDir, manifest));
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
