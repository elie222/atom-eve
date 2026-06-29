import { promises as fs } from "node:fs";
import path from "node:path";
import { readLocalInstallFiles, walk, type InstallFileSpec } from "@atom-eve/install-map";
import {
  atomSchema,
  catalogConfigSchema,
  taxonomySchema,
  type AtomManifest,
  type CatalogConfig,
  type Target,
  type Taxonomy
} from "@atom-eve/schemas";

type RegistryManifest = AtomManifest & {
  repoPath: string;
  scheduled: boolean;
};

export interface RegistryFile extends InstallFileSpec {}

export interface ResolvedRegistryFile extends RegistryFile {
  content: string;
}

export interface SourceRegistryItem {
  name: string;
  type: "registry:block";
  title: string;
  description: string;
  dependencies?: string[];
  files: RegistryFile[];
}

export interface RegistryItem extends SourceRegistryItem {
  dependencies: string[];
  files: ResolvedRegistryFile[];
  meta: {
    atom: string;
    version: string;
    requiredEnv: string[];
    connections: RegistryManifest["connections"];
    skills: RegistryManifest["skills"];
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
  skills: RegistryManifest["skills"];
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

  const sourceItems: SourceRegistryItem[] = [];
  const siteItems: SiteIndexItem[] = [];

  const orderedManifests = orderManifests(manifests, catalogConfig);
  for (const manifest of orderedManifests) {
    siteItems.push(toSiteIndexItem(manifest, catalogConfig));
    const item = await createRegistryItem(rootDir, manifest);
    sourceItems.push(toSourceRegistryItem(item));
    await writeJson(path.join(publicR, `${item.name}.json`), item);
  }

  await writeJson(path.join(rootDir, "public", "index.json"), { items: siteItems });
  await writeJson(path.join(rootDir, "registry.json"), {
    $schema: "https://ui.shadcn.com/schema/registry.json",
    name: "atom-eve",
    homepage: "https://atomeve.dev",
    items: sourceItems
  });
}

function toSourceRegistryItem(item: RegistryItem): SourceRegistryItem {
  return {
    name: item.name,
    type: item.type,
    title: item.title,
    description: item.description,
    ...(item.dependencies.length > 0 ? { dependencies: item.dependencies } : {}),
    files: item.files.map(({ content: _content, ...file }) => file)
  };
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
    await validateAgentStructure(path.join(registryDir, entry.name), parsed);
    const repoPath = `registry/${entry.name}`;
    manifests.push({
      ...parsed,
      repoPath,
      scheduled: await hasScheduleFiles(rootDir, repoPath)
    });
  }

  return manifests.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRegistryItem(rootDir: string, manifest: RegistryManifest): Promise<RegistryItem> {
  const files = await readLocalInstallFiles(rootDir, manifest);
  return {
    name: registryItemName(manifest),
    type: "registry:block",
    title: manifest.title,
    description: manifest.description,
    dependencies: dependenciesForManifest(manifest),
    files,
    meta: {
      atom: manifest.name,
      version: manifest.version,
      requiredEnv: manifest.requiredEnv,
      connections: manifest.connections,
      skills: manifest.skills
    }
  };
}

function registryItemName(manifest: RegistryManifest): string {
  return `eve/${manifest.name}`;
}

function dependenciesForManifest(manifest: RegistryManifest): string[] {
  return [...new Set([...manifest.dependencies, ...(manifest.targetDependencies.eve ?? [])])].sort();
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

const AGENT_STRUCTURE = {
  rootFiles: new Set(["atom.json", "README.md"]),
  rootDirs: new Set(["agent"]),
  agentFiles: new Set(["agent.ts", "instructions.md", "README.md"]),
  agentDirs: new Set(["tools", "channels", "sandbox", "schedules", "skills", "connections", "lib", "evals"])
};

async function validateAgentStructure(agentDir: string, manifest: AtomManifest) {
  await assertAllowedEntries(agentDir, manifest.name, "", AGENT_STRUCTURE.rootFiles, AGENT_STRUCTURE.rootDirs);
  await assertAllowedEntries(path.join(agentDir, "agent"), manifest.name, "agent", AGENT_STRUCTURE.agentFiles, AGENT_STRUCTURE.agentDirs);
  await requireFile(path.join(agentDir, "agent", "agent.ts"), manifest.name, "agent/agent.ts");
  await requireFile(path.join(agentDir, "agent", "instructions.md"), manifest.name, "agent/instructions.md");
}

async function requireFile(filePath: string, agentName: string, label: string) {
  const stat = await fs.stat(filePath).catch(() => undefined);
  if (!stat?.isFile()) throw new Error(`${agentName} is missing ${label}`);
}

async function assertAllowedEntries(
  dir: string,
  agentName: string,
  label: string,
  allowedFiles: Set<string>,
  allowedDirs: Set<string>
) {
  const entries = await fs.readdir(dir, { withFileTypes: true }).catch(() => {
    throw new Error(`${agentName} is missing the ${label || "agent root"} directory`);
  });
  for (const entry of entries) {
    const rel = label ? `${label}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      if (!allowedDirs.has(entry.name)) {
        throw new Error(`${agentName} has an unexpected folder "${rel}/"; allowed here: ${[...allowedDirs].join(", ")}`);
      }
    } else if (!allowedFiles.has(entry.name)) {
      throw new Error(`${agentName} has an unexpected file "${rel}"; allowed here: ${[...allowedFiles].join(", ")}`);
    }
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
    skills: manifest.skills,
    scheduled: manifest.scheduled,
    repoPath: manifest.repoPath,
    featured: config.featured.includes(manifest.name),
    order: order >= 0 ? order : null
  };
}

async function hasScheduleFiles(rootDir: string, repoPath: string): Promise<boolean> {
  const abs = path.join(rootDir, repoPath, "agent/schedules");
  const files = await walk(abs).catch(() => []);
  return files.length > 0;
}

async function writeJson(filePath: string, value: unknown) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`);
}
