import { createAgent } from "flue";
import { runWebsiteQa } from "../tools/website-qa/qa.js";

export default createAgent({
  name: "website-qa",
  instructions:
    "Audit public websites for practical UX, content, SEO, accessibility, and technical quality issues. Save Markdown reports with evidence.",
  tools: [runWebsiteQa]
});
