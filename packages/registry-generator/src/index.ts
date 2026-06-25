import { promises as fs } from "node:fs";
import path from "node:path";
import {
  atomSchema,
  catalogConfigSchema,
  taxonomySchema,
  type AtomManifest,
  type CatalogConfig,
  type Target,
  type Taxonomy
} from "@atomeve/schemas";

type RegistryManifest = AtomManifest & {
  repoPath: string;
  scheduled: boolean;
};

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
    connections: RegistryManifest["connections"];
  };
}

export interface SiteIndexItem {
  name: string;
  title: string;
  description: string;
  category: string;
  family: string;
  author: RegistryManifest["author"];
  version: string;
  targets: Target[];
  integrations: string[];
  connections: RegistryManifest["connections"];
  requiredEnv: string[];
  scheduled: boolean;
  repoPath: string;
  featured: boolean;
  order: number | null;
}

export async function generateRegistry(rootDir: string): Promise<void> {
  const taxonomy = await readTaxonomy(rootDir);
  const catalogConfig = await readCatalogConfig(rootDir);
  const manifests = await readManifests(rootDir, taxonomy);
  await assertUniqueNames(manifests);
  validateCatalogConfig(catalogConfig, manifests);

  const publicR = path.join(rootDir, "public", "r");
  await fs.rm(publicR, { recursive: true, force: true });
  await fs.mkdir(publicR, { recursive: true });

  const items: RegistryItem[] = [];
  const siteItems: SiteIndexItem[] = [];

  const orderedManifests = orderManifests(manifests, catalogConfig);
  for (const manifest of orderedManifests) {
    siteItems.push(toSiteIndexItem(manifest, catalogConfig));
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
    name: "atom-eve",
    homepage: "https://atomeve.dev",
    items
  });
}

export async function readManifests(rootDir: string, taxonomy?: Taxonomy): Promise<RegistryManifest[]> {
  const registryDir = path.join(rootDir, "registry");
  const entries = await fs.readdir(registryDir, { withFileTypes: true }).catch(() => []);
  const manifests: RegistryManifest[] = [];

  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name.startsWith("_")) continue;
    const manifestPath = path.join(registryDir, entry.name, "atom.json");
    const raw = JSON.parse(await fs.readFile(manifestPath, "utf8"));
    const parsed = atomSchema.parse(raw);
    validateTaxonomy(parsed, taxonomy);
    await validateReadme(path.join(registryDir, entry.name, "README.md"), parsed.name);
    const repoPath = `registry/${entry.name}`;
    manifests.push({
      ...parsed,
      repoPath,
      scheduled: await hasScheduleFiles(rootDir, repoPath)
    });
  }

  return manifests.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRegistryItem(rootDir: string, manifest: RegistryManifest, target: Target): Promise<RegistryItem> {
  if (!manifest.targets.includes(target)) {
    throw new Error(`${manifest.name} does not support target ${target}`);
  }

  const files = await mapFiles(rootDir, manifest, target);
  return {
    name: `${target}/${manifest.name}`,
    type: "registry:block",
    title: `${manifest.title} (${target})`,
    description: manifest.description,
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

export async function mapFiles(rootDir: string, manifest: RegistryManifest, target: Target): Promise<RegistryFile[]> {
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
    const instructions = await optionalFile(rootDir, manifest, "shared/instructions.md");
    if (instructions) await add(instructions, `${base}/instructions.md`);
    for (const skill of await discoverFiles(rootDir, manifest, "shared/skills")) await add(skill, `${base}/skills/${path.basename(skill)}`);
    for (const lib of await discoverFiles(rootDir, manifest, "shared/lib")) await add(lib, `${base}/lib/${path.basename(lib)}`);
    const entrypoint = await requiredFile(rootDir, manifest, "targets/eve/agent.ts");
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
    const entrypoint = await requiredFile(rootDir, manifest, "targets/flue/agent.ts");
    await add(entrypoint, `~/${root}/agents/${manifest.name}.ts`);
    for (const skill of await discoverFiles(rootDir, manifest, "shared/skills")) {
      await add(skill, `~/${root}/skills/${manifest.name}-${path.basename(skill, path.extname(skill))}/SKILL.md`);
    }
    for (const lib of await discoverFiles(rootDir, manifest, "shared/lib")) {
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

async function optionalFile(rootDir: string, manifest: RegistryManifest, source: string): Promise<string | undefined> {
  const abs = path.join(rootDir, manifest.repoPath, source);
  try {
    const stat = await fs.stat(abs);
    return stat.isFile() ? source : undefined;
  } catch {
    return undefined;
  }
}

async function requiredFile(rootDir: string, manifest: RegistryManifest, source: string): Promise<string> {
  const found = await optionalFile(rootDir, manifest, source);
  if (!found) throw new Error(`${manifest.name} is missing ${source}`);
  return found;
}

async function discoverFiles(rootDir: string, manifest: RegistryManifest, sourceDir: string): Promise<string[]> {
  const abs = path.join(rootDir, manifest.repoPath, sourceDir);
  const files = await walk(abs).catch(() => []);
  return files
    .map((file) => path.relative(path.join(rootDir, manifest.repoPath), file))
    .sort((a, b) => a.localeCompare(b));
}

async function addTree(
  rootDir: string,
  manifest: RegistryManifest,
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

async function readCatalogConfig(rootDir: string): Promise<CatalogConfig> {
  const raw = JSON.parse(await fs.readFile(path.join(rootDir, "catalog.config.json"), "utf8"));
  return catalogConfigSchema.parse(raw);
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

async function validateReadme(readmePath: string, agentName: string) {
  const content = await fs.readFile(readmePath, "utf8").catch(() => {
    throw new Error(`${agentName} is missing README.md`);
  });
  const requiredSections = ["What it does", "Supported targets", "Install", "Setup", "Usage", "Connections and auth", "Limitations"];
  for (const section of requiredSections) {
    const pattern = new RegExp(`^##\\s+${escapeRegExp(section)}\\s*$`, "im");
    if (!pattern.test(content)) throw new Error(`${agentName} README.md is missing "## ${section}"`);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

async function assertUniqueNames(manifests: RegistryManifest[]) {
  const seen = new Set<string>();
  for (const manifest of manifests) {
    if (seen.has(manifest.name)) throw new Error(`Duplicate agent name: ${manifest.name}`);
    seen.add(manifest.name);
  }
}

function validateCatalogConfig(config: CatalogConfig, manifests: RegistryManifest[]) {
  const names = new Set(manifests.map((manifest) => manifest.name));
  for (const slug of [...config.featured, ...config.homepageOrder]) {
    if (!names.has(slug)) throw new Error(`catalog.config.json references unknown agent: ${slug}`);
  }
}

function orderManifests(manifests: RegistryManifest[], config: CatalogConfig): RegistryManifest[] {
  const order = new Map(config.homepageOrder.map((slug, index) => [slug, index]));
  return [...manifests].sort((a, b) => {
    const aOrder = order.get(a.name) ?? Number.MAX_SAFE_INTEGER;
    const bOrder = order.get(b.name) ?? Number.MAX_SAFE_INTEGER;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return a.name.localeCompare(b.name);
  });
}

function toSiteIndexItem(manifest: RegistryManifest, config: CatalogConfig): SiteIndexItem {
  const order = config.homepageOrder.indexOf(manifest.name);
  return {
    name: manifest.name,
    title: manifest.title,
    description: manifest.description,
    category: manifest.category,
    family: manifest.family,
    author: manifest.author,
    version: manifest.version,
    targets: manifest.targets,
    integrations: manifest.integrations,
    connections: manifest.connections,
    requiredEnv: manifest.requiredEnv,
    scheduled: manifest.scheduled,
    repoPath: manifest.repoPath,
    featured: config.featured.includes(manifest.name),
    order: order >= 0 ? order : null
  };
}

async function hasScheduleFiles(rootDir: string, repoPath: string): Promise<boolean> {
  for (const sourceDir of ["targets/eve/schedules", "targets/flue/workflows"]) {
    const abs = path.join(rootDir, repoPath, sourceDir);
    const files = await walk(abs).catch(() => []);
    if (files.length > 0) return true;
  }
  return false;
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
