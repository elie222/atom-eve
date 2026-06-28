export const blogWriterSmokePrompt = [
  "Draft a long-form SEO article from this brief.",
  "",
  "Primary keyword: project management software for small teams",
  "Audience: founders at early-stage startups",
  "Target word count: 1800",
  "Secondary keywords: task tracking, team collaboration, project templates",
  "Internal links: Pricing (https://example.com/pricing), Templates (https://example.com/templates)",
  "",
  "Use the draft_article planner first, then expand the scaffold into a draft and walk the SEO checks. Present it as a draft for approval; do not publish."
].join("\n");

export const blogWriterEveToolName = "draft_article";

export const blogWriterReplyPattern = /outline|draft|SEO/i;
