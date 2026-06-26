/* Presentation helpers shared across server + client components. */

export const REPO = "https://github.com/atomeve";

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

export const targetLabel = (t: string): string => (t === "eve" ? "eve.dev" : t);

export function installCommand(name: string, target?: string): string {
  return target ? `npx atom-eve add ${name} --target ${target}` : `npx atom-eve add ${name}`;
}

/* Lightweight JSON syntax highlight -> HTML string (keys green, strings amber,
 * numbers/booleans blue). Input is trusted registry data. */
export function highlightJson(obj: unknown): string {
  let s = JSON.stringify(obj, null, 2) ?? "";
  s = s.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
  s = s.replace(/"([^"\\]*)"(\s*:)?/g, (_m, content: string, colon?: string) =>
    colon
      ? `<span style="color:#54f0a8">"${content}"</span>${colon}`
      : `<span style="color:#ffb454">"${content}"</span>`,
  );
  s = s.replace(/: (true|false|-?\d+(?:\.\d+)?)/g, ': <span style="color:#37d6ff">$1</span>');
  return s;
}
