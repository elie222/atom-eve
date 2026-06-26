/* Build-time registry data access. SERVER ONLY — uses node:fs.
 * Import this from .astro frontmatter, never from a client component. */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { catGlyph, famColor, installCommand, prettify } from "./format";

export interface RegistryItem {
  name: string;
  title: string;
  description: string;
  category: string;
  family: string;
  version: string;
  targets: string[];
  integrations?: string[];
  connections?: { name: string; type: string; auth: string }[];
  requiredEnv?: string[];
  memory?: boolean;
  scheduled?: boolean;
  repoPath: string;
  featured?: boolean;
  order?: number | null;
}

export interface AgentCard {
  name: string;
  title: string;
  description: string;
  version: string;
  family: string;
  familyLabel: string;
  categoryLabel: string;
  color: string;
  glyph: string;
  integrations: string;
  targets: string;
  memory: boolean;
  installCmd: string;
}

export interface Taxonomy {
  families: string[];
  categories: { id: string; family: string; label: string }[];
}

function findRoot(): string {
  let dir = process.cwd();
  for (let i = 0; i < 6; i++) {
    if (existsSync(path.join(dir, "public", "index.json")) && existsSync(path.join(dir, "taxonomy.json"))) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  throw new Error("Could not locate registry root (public/index.json) from " + process.cwd());
}

const ROOT = findRoot();

export function getItems(): RegistryItem[] {
  const index = JSON.parse(readFileSync(path.join(ROOT, "public", "index.json"), "utf8"));
  const items = (index.items ?? []) as RegistryItem[];
  return [...items].sort((a, b) => (a.order ?? Number.MAX_SAFE_INTEGER) - (b.order ?? Number.MAX_SAFE_INTEGER));
}

export function getTaxonomy(): Taxonomy {
  return JSON.parse(readFileSync(path.join(ROOT, "taxonomy.json"), "utf8")) as Taxonomy;
}

export function toCard(item: RegistryItem): AgentCard {
  return {
    name: item.name,
    title: item.title,
    description: item.description,
    version: item.version,
    family: item.family,
    familyLabel: prettify(item.family),
    categoryLabel: prettify(item.category),
    color: famColor(item.family),
    glyph: catGlyph(item.category),
    integrations: (item.integrations ?? []).map(prettify).join(" · "),
    targets: (item.targets ?? []).join(" · "),
    memory: Boolean(item.memory),
    installCmd: installCommand(item.name),
  };
}

export function familyCounts(items: RegistryItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const it of items) counts[it.family] = (counts[it.family] ?? 0) + 1;
  return counts;
}

export function getReadmeHtml(item: RegistryItem): string {
  const file = path.join(ROOT, item.repoPath, "README.md");
  const md = existsSync(file) ? readFileSync(file, "utf8") : `# ${item.title}\n\n${item.description}`;
  const pageMd = stripCatalogOnlySections(stripDuplicateTitle(md, item.title));
  return marked.parse(pageMd, { async: false }) as string;
}

function stripDuplicateTitle(md: string, title: string): string {
  const lines = md.split(/\r?\n/);
  const firstContentIndex = lines.findIndex((line) => line.trim().length > 0);
  if (firstContentIndex < 0) return md;

  const heading = lines[firstContentIndex].trim().match(/^#\s+(.+?)\s*$/);
  if (!heading) return md;

  if (normalizeHeading(heading[1]) !== normalizeHeading(title)) return md;

  lines.splice(firstContentIndex, 1);
  if (lines[firstContentIndex]?.trim() === "") lines.splice(firstContentIndex, 1);
  return lines.join("\n").trimStart();
}

function stripCatalogOnlySections(md: string): string {
  const skip = new Set(["supported targets", "install"]);
  const lines = md.split(/\r?\n/);
  const kept: string[] = [];
  let skippingLevel: number | null = null;

  for (const line of lines) {
    const heading = line.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (heading && skippingLevel !== null && heading[1].length <= skippingLevel) {
      skippingLevel = null;
    }

    if (skippingLevel !== null) continue;

    if (heading && heading[1].length === 2 && skip.has(normalizeHeading(heading[2]))) {
      skippingLevel = heading[1].length;
      continue;
    }

    kept.push(line);
  }

  return kept.join("\n").trim();
}

function normalizeHeading(value: string): string {
  return value
    .replace(/[`*_~[\]()]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/* Other community builds of the same task — grouped by category. */
export function variantsOf(item: RegistryItem, items: RegistryItem[]): RegistryItem[] {
  return items.filter((it) => it.category === item.category && it.name !== item.name);
}
