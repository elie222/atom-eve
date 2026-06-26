/* Presentation helpers shared across server + client components. */

export const REPO = "https://github.com/elie222/atom-eve";
export const DISCORD = "https://discord.gg/RWwKa2Sn7h";
export const X_PROFILE = "https://x.com/elie2222";

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

export const targetLabel = (t: string): string => t;

export function installCommand(name: string, target?: string): string {
  return target ? `npx atom-eve add ${name} --target ${target}` : `npx atom-eve add ${name}`;
}
