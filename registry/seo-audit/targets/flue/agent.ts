import { defineAgent } from "@flue/runtime";

const instructions = [
  "Audit supplied URLs or sitemaps for practical SEO issues.",
  "Use Flue's native sandbox command, fetch, and browser capabilities where available; do not add a custom browser wrapper tool.",
  "Inspect titles, descriptions, headings, canonical and robots signals, broken content or CTA issues, content gaps, internal links, and visible copy quality.",
  "Compare the current run with local files under reports/seo-audit/history when available.",
  "Write a concise Markdown report to reports/seo-audit/latest.md when filesystem access exists, plus timestamped Markdown and compact JSON history files.",
  "Include previous-vs-current deltas and stable issue IDs so later runs can classify new, recurring, and resolved findings.",
  "Note that file-backed history is the MVP and DB-backed history is future work."
].join(" ");

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions
}));
