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
    target: Target;
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
    for (const target of manifest.targets) {
      const item = await createRegistryItem(rootDir, manifest, target);
      sourceItems.push(toSourceRegistryItem(item));
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
    const repoPath = `registry/${entry.name}`;
    await validateTriggerPromptSources(path.join(registryDir, entry.name), parsed.name);
    if (parsed.targets.includes("flue")) {
      await validateFlueInstructions(path.join(registryDir, entry.name), parsed.name);
    }
    manifests.push({
      ...parsed,
      repoPath,
      scheduled: await hasScheduleFiles(rootDir, repoPath)
    });
  }

  return manifests.sort((a, b) => a.name.localeCompare(b.name));
}

export async function createRegistryItem(rootDir: string, manifest: RegistryManifest, target: Target): Promise<RegistryItem> {
  const files = await readLocalInstallFiles(rootDir, manifest, target);
  return {
    name: `${target}/${manifest.name}`,
    type: "registry:block",
    title: `${manifest.title} (${target})`,
    description: manifest.description,
    dependencies: dependenciesForTarget(manifest, target),
    files,
    meta: {
      atom: manifest.name,
      target,
      version: manifest.version,
      requiredEnv: manifest.requiredEnv,
      connections: manifest.connections,
      skills: manifest.skills
    }
  };
}

function dependenciesForTarget(manifest: RegistryManifest, target: Target): string[] {
  return [...new Set([...manifest.dependencies, ...(manifest.targetDependencies[target] ?? [])])].sort();
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

async function validateTriggerPromptSources(agentDir: string, agentName: string) {
  const triggerDirs = ["targets/eve/schedules", "targets/flue/workflows"];
  for (const triggerDir of triggerDirs) {
    const files = await walk(path.join(agentDir, triggerDir)).catch(() => []);
    for (const file of files) {
      if (!file.endsWith(".ts")) continue;
      const content = await fs.readFile(file, "utf8");
      if (/markdown:\s*["`]/.test(content) || /session\.prompt\(\s*["`]/.test(content)) {
        const rel = path.relative(agentDir, file);
        throw new Error(`${agentName} ${rel} must import trigger prompt text from shared/lib/prompts.ts`);
      }
    }
  }
}

async function validateFlueInstructions(agentDir: string, agentName: string) {
  const agentPath = path.join(agentDir, "targets/flue/agent.ts");
  const content = await fs.readFile(agentPath, "utf8").catch(() => {
    throw new Error(`${agentName} is missing targets/flue/agent.ts`);
  });
  if (!/(['"])__ATOM_INSTRUCTIONS__\1/.test(content)) {
    throw new Error(
      `${agentName} targets/flue/agent.ts must set instructions to the "__ATOM_INSTRUCTIONS__" placeholder ` +
        `so shared/instructions.md is the single source of truth`
    );
  }
  if (/Instructions\b/.test(content)) {
    throw new Error(
      `${agentName} targets/flue/agent.ts must not import a separate instructions constant from prompts; ` +
        `use the "__ATOM_INSTRUCTIONS__" placeholder instead`
    );
  }
  const instructionsPath = path.join(agentDir, "shared/instructions.md");
  try {
    await fs.stat(instructionsPath);
  } catch {
    throw new Error(`${agentName} uses the instructions placeholder but is missing shared/instructions.md`);
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
