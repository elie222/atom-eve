/* Build-time registry data access. SERVER ONLY — uses node:fs.
 * Import this from .astro frontmatter, never from a client component. */
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { marked } from "marked";
import { createHighlighter, type Highlighter } from "shiki";
import { catGlyph, famColor, fileGroup, fileLang, installCommand, installTargets, prettify, type FileGroup } from "./format";

/* ------------------------------------------------------------------ *
 * Build-time syntax highlighting (Shiki, ships with Astro)
 * ------------------------------------------------------------------ */

const SHIKI_THEME = "tokyo-night";
/* Map our coarse fileLang() keys to Shiki language ids. */
const SHIKI_LANGS: Record<string, string> = {
  ts: "typescript",
  js: "javascript",
  json: "json",
  md: "markdown",
  bash: "bash",
  yaml: "yaml",
  text: "text",
};

let highlighterPromise: Promise<Highlighter> | null = null;
function getHighlighter(): Promise<Highlighter> {
  highlighterPromise ??= createHighlighter({
    themes: [SHIKI_THEME],
    langs: ["typescript", "javascript", "json", "markdown", "bash", "yaml"],
  });
  return highlighterPromise;
}

async function highlight(code: string, lang: string): Promise<string> {
  const hl = await getHighlighter();
  return hl.codeToHtml(code, { lang: SHIKI_LANGS[lang] ?? "text", theme: SHIKI_THEME });
}

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
  source?: {
    type: "external-template";
    repo: string;
    url: string;
    cloneUrl: string;
  };
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
  external: boolean;
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

export interface RegistryPayload {
  /** Registry item name, e.g. "eve/website-qa". */
  name: string;
  /** The resolved shadcn registry-item JSON (with inline file content). */
  json: string;
}

/* The generated, content-resolved shadcn payloads (public/r/<name>.json), keyed
 * by registry item name. Served at /r/<name>.json so the registry works as a
 * hosted shadcn namespace (`npx shadcn add @atom-eve/<name>`). */
export function getRegistryPayloads(): RegistryPayload[] {
  const registry = JSON.parse(readFileSync(path.join(ROOT, "registry.json"), "utf8")) as {
    items?: { name: string }[];
  };
  return (registry.items ?? []).map((item) => ({
    name: item.name,
    json: readFileSync(path.join(ROOT, "public", "r", `${item.name}.json`), "utf8"),
  }));
}

export function toCard(item: RegistryItem): AgentCard {
  const external = item.source?.type === "external-template";
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
    targets: external ? "External" : installTargets(item.targets).join(" · "),
    memory: Boolean(item.memory),
    installCmd: installCommand(item.name),
    external,
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

/* ------------------------------------------------------------------ *
 * Source-code browser data
 *
 * The build resolves every agent into one content-inlined shadcn payload at
 * public/r/<name>.json (see packages/registry-generator). We surface those
 * files on the detail page so a visitor can read the real instructions, tools,
 * and skills before installing — the same transparency shadcn gives its
 * components. Flue installs are generated by the CLI from that eve source; they
 * are not emitted as separate static registry payloads.
 * ------------------------------------------------------------------ */

export interface AgentFile {
  /** Install destination, e.g. "~/agent/tools/foo.ts". */
  target: string;
  /** Final path segment, e.g. "foo.ts". */
  name: string;
  /** Raw source (used for copy-to-clipboard). */
  content: string;
  /** Shiki-highlighted markup of `content` (used for display). */
  html: string;
  group: FileGroup;
  lang: string;
  remoteSkill?: {
    ref: string;
    url: string;
  };
}

export interface AgentTargetFiles {
  target: string;
  files: AgentFile[];
  skills: RemoteSkillRef[];
  connections: { name: string; type: string; auth: string }[];
  requiredEnv: string[];
}

interface ResolvedPayload {
  files: { target: string; content: string }[];
  meta?: {
    skills?: RemoteSkillRef[];
    connections?: { name: string; type: string; auth: string }[];
    requiredEnv?: string[];
  };
}

interface RemoteSkillRef {
  ref: string;
}

/* The installable source for an agent. Reads the generated payload; returns []
 * when it is missing so a partial build never breaks the page. Source is
 * syntax-highlighted at build time with Shiki so the browser ships zero
 * highlighting JS. */
export async function getAgentFiles(item: RegistryItem): Promise<AgentTargetFiles[]> {
  const file = path.join(ROOT, "public", "r", `${registryPayloadName(item)}.json`);
  if (!existsSync(file)) return [];
  const payload = JSON.parse(readFileSync(file, "utf8")) as ResolvedPayload;
  const files: AgentFile[] = await Promise.all(
    payload.files
      // Evals still install, but they're test scaffolding — noise for someone
      // reading "what is this agent", so keep them out of the browser.
      .filter((f) => fileGroup(f.target) !== "Evals")
      .map(async (f) => {
        const lang = fileLang(f.target);
        return {
          target: f.target,
          name: f.target.slice(f.target.lastIndexOf("/") + 1),
          content: f.content,
          html: await highlight(f.content, lang),
          group: fileGroup(f.target),
          lang,
        };
      }),
  );
  files.push(...remoteSkillFiles(payload.meta?.skills ?? []));
  return [
    {
      target: (item.targets ?? ["eve"])[0] ?? "eve",
      files,
      skills: payload.meta?.skills ?? [],
      connections: payload.meta?.connections ?? [],
      requiredEnv: payload.meta?.requiredEnv ?? [],
    },
  ];
}

function registryPayloadName(item: RegistryItem): string {
  return `${(item.targets ?? ["eve"])[0] ?? "eve"}/${item.name}`;
}

function remoteSkillFiles(skills: RemoteSkillRef[]): AgentFile[] {
  return skills.map((skill) => {
    const skillName = skill.ref.includes("@") ? skill.ref.slice(skill.ref.lastIndexOf("@") + 1) : baseRefName(skill.ref);
    const url = skillUrl(skill.ref);
    const content = `Imported from ${url}`;
    return {
      target: `~/agent/skills/${skillName}/SKILL.md`,
      name: `${skillName} (remote)`,
      content,
      html: remoteSkillHtml(skill.ref, url),
      group: "Skills",
      lang: "text",
      remoteSkill: {
        ref: skill.ref,
        url,
      },
    };
  });
}

function baseRefName(ref: string): string {
  return ref.split("/").filter(Boolean).at(-1) ?? ref;
}

function skillUrl(ref: string): string {
  const [repo, skill] = ref.split("@");
  const [owner, name] = repo.split("/");
  if (!owner || !name) return `https://www.skills.sh/${ref}`;
  return skill ? `https://www.skills.sh/${owner}/${name}/${skill}` : `https://www.skills.sh/${owner}/${name}`;
}

function remoteSkillHtml(ref: string, url: string): string {
  return `<div class="p-5 font-mono text-[13px] leading-6 text-ink2">
    <div class="mb-2 font-pixel text-[8px] tracking-[0.06em] text-dim">REMOTE SKILL</div>
    <p class="mb-4">Imported from <code class="text-green">${escapeHtml(ref)}</code>.</p>
    <a class="font-mono text-[12px] text-green underline decoration-dotted underline-offset-4" href="${escapeHtml(url)}" target="_blank" rel="noreferrer">Open full skill ↗</a>
  </div>`;
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (char) => {
    switch (char) {
      case "&":
        return "&amp;";
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case '"':
        return "&quot;";
      default:
        return "&#39;";
    }
  });
}

/* Other community builds of the same task — grouped by category. */
export function variantsOf(item: RegistryItem, items: RegistryItem[]): RegistryItem[] {
  return items.filter((it) => it.category === item.category && it.name !== item.name);
}
