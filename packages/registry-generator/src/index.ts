import { promises as fs } from "node:fs";
import path from "node:path";
import { atomSchema, taxonomySchema, type AtomManifest, type Target, type Taxonomy } from "@atomeve/schemas";

export interface RegistryFile {
  path: string;
  target: string;
  type: "registry:file";
  content: string;
}

export interface RegistryItem {
  name: string;
  type: "registry:block";
  title: string;
  description: string;
  files: RegistryFile[];
  meta: {
    atom: string;
    target: Target;
    version: string;
    requiredEnv: string[];
    connections: AtomManifest["connections"];
  };
}

export interface SiteIndexItem {
  name: string;
  taskSlug: string;
  title: string;
  descriptor: string;
  category: string;
  family: string;
  author: AtomManifest["author"];
  version: string;
  targets: Target[];
  integrations: string[];
  connections: AtomManifest["connections"];
  requiredEnv: string[];
  schedule: AtomManifest["schedule"];
  repoPath: string;
}

export async function generateRegistry(rootDir: string): Promise<void> {
  const taxonomy = await readTaxonomy(rootDir);
  const manifests = await readManifests(rootDir, taxonomy);
  await assertUniqueNames(manifests);

  const publicR = path.join(rootDir, "public", "r");
  await fs.rm(publicR, { recursive: true, force: true });
  await fs.mkdir(publicR, { recursive: true });

  const items: RegistryItem[] = [];
  const siteItems: SiteIndexItem[] = [];

  for (const manifest of manifests) {
    siteItems.push(toSiteIndexItem(manifest));
    for (const target of manifest.targets) {
      const item = await createRegistryItem(rootDir, manifest, target);
      items.push(item);
      const outPath = path.join(publicR, target, `${manifest.name}.json`);
      await fs.mkdir(path.dirname(outPath), { recursive: true });
      await writeJson(outPath, item);
    }
  }

  await writeJson(path.join(rootDir, "public", "index.json"), { items: siteItems });
  await writeJson(path.join(rootDir, "registry.json"), {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "atomeve",
    homepage: "https://atomeve.dev",
    items
  });
}

export async function readManifests(rootDir: string, taxonomy?: Taxonomy): Promise<AtomManifest[]> {
  const registryDir = path.join(rootDir, "registry");
  const entries = await fs.readdir(registryDir, { withFileTypes: true }).catch(() => []);
  const manifests: AtomManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const manifestPath = path.join(registryDir, entry.name, "atom.json");
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const parsed = atomSchema.parse(raw);
    validateTaxonomy(parsed, taxonomy);
    manifests.push(parsed);
  }

  return manifests.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRegistryItem(rootDir: string, manifest: AtomManifest, target: Target): Promise<RegistryItem> {
  if (!manifest.targets.includes(target)) {
    throw new Error(`${manifest.name} does not support target ${target}`);
  }

  const files = await mapFiles(rootDir, manifest, target);
  return {
    name: `${target}/${manifest.name}`,
    type: "registry:block",
    title: `${manifest.title} (${target})`,
    description: manifest.descriptor,
    files,
    meta: {
      atom: manifest.name,
      target,
      version: manifest.version,
      requiredEnv: manifest.requiredEnv,
      connections: manifest.connections
    }
  };
}

export async function mapFiles(rootDir: string, manifest: AtomManifest, target: Target): Promise<RegistryFile[]> {
  const files: RegistryFile[] = [];
  const add = async (source: string, destination: string) => {
    const absSource = path.join(rootDir, manifest.repoPath, source);
    const content = await fs.readFile(absSource, "utf8");
    files.push({
      path: `${manifest.repoPath}/${source}`,
      target: destination,
      type: "registry:file",
      content
    });
  };

  if (target === "eve") {
    const base = `~/agent/subagents/${manifest.name}`;
    if (manifest.shared.instructions) await add(manifest.shared.instructions, `${base}/instructions.md`);
    for (const skill of manifest.shared.skills) await add(skill, `${base}/skills/${path.basename(skill)}`);
    for (const lib of manifest.shared.lib) await add(lib, `${base}/lib/${path.basename(lib)}`);
    const entrypoint = manifest.entrypoints.eve;
    if (!entrypoint) throw new Error(`${manifest.name} is missing eve entrypoint`);
    await add(entrypoint, `${base}/agent.ts`);
    await addTree(rootDir, manifest, "targets/eve/tools", `${base}/tools`, add);
    await addTree(rootDir, manifest, "targets/eve/connections", `${base}/connections`, add);
    await addTree(rootDir, manifest, "targets/eve/sandbox", `${base}/sandbox`, add);
    await addTree(rootDir, manifest, "targets/eve/schedules", "~/agent/schedules", async (source, destination) => {
      const ext = path.extname(destination);
      const stem = destination.slice(0, -ext.length);
      await add(source, `${stem.replace(/\/([^/]+)$/, `/${manifest.name}-$1`)}${ext}`);
    });
  } else {
    const root = "src";
    const entrypoint = manifest.entrypoints.flue;
    if (!entrypoint) throw new Error(`${manifest.name} is missing flue entrypoint`);
    await add(entrypoint, `~/${root}/agents/${manifest.name}.ts`);
    for (const skill of manifest.shared.skills) {
      await add(skill, `~/${root}/skills/${manifest.name}-${path.basename(skill, path.extname(skill))}/SKILL.md`);
    }
    for (const lib of manifest.shared.lib) {
      await add(lib, `~/${root}/lib/agents/${manifest.name}/${path.basename(lib)}`);
    }
    await addTree(rootDir, manifest, "targets/flue/tools", `~/${root}/tools/${manifest.name}`, add);
    await addTree(rootDir, manifest, "targets/flue/workflows", `~/${root}/workflows`, async (source, destination) => {
      const ext = path.extname(destination);
      const stem = destination.slice(0, -ext.length);
      await add(source, `${stem.replace(/\/([^/]+)$/, `/${manifest.name}-$1`)}${ext}`);
    });
  }

  return files;
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

async function readTaxonomy(rootDir: string): Promise<Taxonomy> {
  const raw = JSON.parse(await fs.readFile(path.join(rootDir, "taxonomy.json"), "utf8"));
  return taxonomySchema.parse(raw);
}

function validateTaxonomy(manifest: AtomManifest, taxonomy?: Taxonomy) {
  if (!taxonomy) return;
  if (!taxonomy.families.includes(manifest.family)) {
    throw new Error(`${manifest.name} uses unknown family ${manifest.family}`);
  }
  const category = taxonomy.categories.find((item) => item.id === manifest.category);
  if (!category) throw new Error(`${manifest.name} uses unknown category ${manifest.category}`);
  if (category.family !== manifest.family) {
    throw new Error(`${manifest.name} category ${manifest.category} belongs to ${category.family}, not ${manifest.family}`);
  }
}

async function assertUniqueNames(manifests: AtomManifest[]) {
  const seen = new Set<string>();
  for (const manifest of manifests) {
    if (seen.has(manifest.name)) throw new Error(`Duplicate agent name: ${manifest.name}`);
    seen.add(manifest.name);
  }
}

function toSiteIndexItem(manifest: AtomManifest): SiteIndexItem {
  return {
    name: manifest.name,
    taskSlug: manifest.taskSlug,
    title: manifest.title,
    descriptor: manifest.descriptor,
    category: manifest.category,
    family: manifest.family,
    author: manifest.author,
    version: manifest.version,
    targets: manifest.targets,
    integrations: manifest.integrations,
    connections: manifest.connections,
    requiredEnv: manifest.requiredEnv,
    schedule: manifest.schedule,
    repoPath: manifest.repoPath
  };
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
