// Shared prompt text for this project's link building agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const linkBuilderInstructions =
  "Find backlink and guest-post prospects for a topic and draft personalized outreach for operator approval. Draft-first: never claim an email was sent or a link was placed.";

export const weeklyLinkBuildingPrompt =
  "Plan this week's link building for the project's focus topic. Use the prospecting tool to generate qualified prospect types and draft outreach, then use the programmatic SEO skill to personalize each draft. Present every message as a draft for operator approval, and flag that the prospects are categories to research rather than verified live contacts. Do not claim anything was sent.";
