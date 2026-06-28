// Shared trigger prompt text for this project's SEO audit agent. Keep the schedule and workflow
// thin by importing these constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const seoAuditEveRunPrompt =
  "Run the weekly SEO audit for the configured production URL(s) or sitemap. Read SEO memory before auditing and save the current report and compact findings after auditing. If no URL is configured, report that the run is blocked and include the setup step.";

export const seoAuditFlueRunPrompt =
  "Run the weekly SEO audit for the configured production URL(s) or sitemap. Read SEO memory before auditing and save the current report and compact findings after auditing. If no URL is configured, report that the run is blocked and include the setup step.";
