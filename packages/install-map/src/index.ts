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
  const add = (source: string, destination: string) => {
    files.push({
      path: `${manifest.repoPath}/${source}`,
      target: destination,
      type: "registry:file"
    });
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
      add(lib, `${base}/lib/${path.posix.basename(lib)}`);
    }
    add(await requiredFile("targets/eve/agent.ts"), `${base}/agent.ts`);
    await addTree("targets/eve/tools", `${base}/tools`);
    await addTree("targets/eve/connections", `${base}/connections`);
    await addTree("targets/eve/sandbox", `${base}/sandbox`);
    await addTree("targets/eve/schedules", "~/agent/schedules");
    await addTree("evals/eve", "~/evals");
    return files;
  }

  const sourceRoot = "src";
  add(await requiredFile("targets/flue/agent.ts"), `~/${sourceRoot}/agents/${manifest.name}.ts`);
  for (const skill of await sourceReader.discoverFiles("shared/skills")) {
    const name = path.posix.basename(skill, path.posix.extname(skill));
    add(skill, `~/${sourceRoot}/skills/${manifest.name}-${name}/SKILL.md`);
  }
  for (const lib of await sourceReader.discoverFiles("shared/lib")) {
    add(lib, `~/${sourceRoot}/lib/agents/${manifest.name}/${path.posix.basename(lib)}`);
  }
  await addTree("targets/flue/tools", `~/${sourceRoot}/tools/${manifest.name}`);
  await addTree("targets/flue/workflows", `~/${sourceRoot}/workflows`, (source, destination) => {
    const ext = path.posix.extname(destination);
    const stem = destination.slice(0, -ext.length);
    add(source, `${stem.replace(/\/([^/]+)$/, `/${manifest.name}-$1`)}${ext}`);
  });
  return files;
}
