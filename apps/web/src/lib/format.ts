/* Presentation helpers shared across server + client components. */

export const REPO = "https://github.com/elie222/atom-eve";
export const DISCORD = "https://discord.gg/RWwKa2Sn7h";
export const X_PROFILE = "https://x.com/elie2222";
export const EVE_URL = "https://eve.dev";
export const FLUE_URL = "https://flueframework.com";

/* family -> accent colour (arcade palette) */
export const FAM: Record<string, string> = {
  engineering: "#37d6ff",
  growth: "#54f0a8",
  revenue: "#ffb454",
  support: "#ff45c2",
  ops: "#a974ff",
  data: "#c08bff",
};
export const famColor = (family: string): string => FAM[family] ?? "#54f0a8";

/* category -> glyph key */
const CAT_GLYPH: Record<string, string> = {
  ads: "out",
  seo: "mag",
  qa: "bug",
  support: "chat",
  outreach: "social",
  analytics: "bars",
  content: "content",
  social: "social",
  ops: "gear",
  docs: "docs",
  deploy: "deploy",
  code: "code",
  review: "rev",
};
export const catGlyph = (category: string): string => CAT_GLYPH[category] ?? "gear";

const ACRONYMS = new Set(["seo", "api", "qa", "crm", "ai", "ci"]);

export function prettify(slug: string): string {
  return String(slug)
    .split(/[/\-_]/)
    .filter(Boolean)
    .map((w) => (ACRONYMS.has(w.toLowerCase()) ? w.toUpperCase() : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

export function installCommand(name: string, target?: string): string {
  return target ? `npx atom-eve add ${name} --target ${target}` : `npx atom-eve add ${name}`;
}

/* ------------------------------------------------------------------ *
 * Source-code browser helpers (shared server + client)
 * ------------------------------------------------------------------ */

/* Conceptual buckets an agent's files fall into, in display order. These map
 * directly to "what is this agent" — its instructions, tools, and skills. */
export const FILE_GROUPS = [
  "Instructions",
  "Agent",
  "Tools",
  "Skills",
  "Connections",
  "Sandbox",
  "Schedules",
  "Workflows",
  "Library",
  "Evals",
  "Other",
] as const;

export type FileGroup = (typeof FILE_GROUPS)[number];

/* Classify an install target path (e.g. "~/agent/tools/foo.ts") into a bucket.
 * Order matters: more specific patterns are checked first so the agent entry
 * file is not swallowed by the generic "~/agent/" prefix. */
export function fileGroup(targetPath: string): FileGroup {
  const p = targetPath.toLowerCase();
  if (/\/instructions\.md$/.test(p)) return "Instructions";
  if (/\/skills?\//.test(p) || /\/skill\.md$/.test(p)) return "Skills";
  if (/\/tools?\//.test(p)) return "Tools";
  if (/\/connections?\//.test(p)) return "Connections";
  if (/\/sandbox\//.test(p)) return "Sandbox";
  if (/\/schedules?\//.test(p)) return "Schedules";
  if (/\/workflows?\//.test(p)) return "Workflows";
  if (/\/lib\//.test(p)) return "Library";
  if (/(^|\/)~\/evals\//.test(p) || /\/evals?\//.test(p) || /\.eval\.ts$/.test(p)) return "Evals";
  if (/\/agent\.ts$/.test(p) || /\/agents\/[^/]+\.ts$/.test(p)) return "Agent";
  return "Other";
}

/* Coarse language label / highlight key from a file extension. */
export function fileLang(targetPath: string): string {
  const ext = targetPath.slice(targetPath.lastIndexOf(".") + 1).toLowerCase();
  const map: Record<string, string> = {
    ts: "ts",
    tsx: "ts",
    js: "js",
    mjs: "js",
    md: "md",
    json: "json",
    sh: "bash",
    bash: "bash",
    yml: "yaml",
    yaml: "yaml",
    txt: "text",
  };
  return map[ext] ?? "text";
}

/* Final path segment, e.g. "instructions.md". */
export function baseName(targetPath: string): string {
  const clean = targetPath.replace(/\/+$/, "");
  return clean.slice(clean.lastIndexOf("/") + 1) || clean;
}
