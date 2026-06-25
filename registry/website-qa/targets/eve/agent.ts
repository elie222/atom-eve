import { defineAgent } from "eve";

export default defineAgent({
  model: "anthropic/claude-sonnet-4.6",
  description:
    "Audits public websites for practical UX, content, SEO, accessibility, and technical quality issues. Saves Markdown reports with evidence."
});
