import { createWorkflow } from "flue";

export default createWorkflow({
  name: "seo-audit-weekly",
  async run() {
    return [
      "Run the weekly SEO audit for https://example.com or its sitemap.",
      "Replace this placeholder with the production URL before enabling the workflow.",
      "Use native sandbox command, fetch, and browser capabilities where available.",
      "Compare against reports/seo-audit/history and write reports/seo-audit/latest.md."
    ].join(" ");
  }
});
