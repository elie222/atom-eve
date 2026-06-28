// Shared trigger prompt text for this project's keyword research agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const weeklyKeywordResearchPrompt =
  "Research this project's target keywords with the DataForSEO tool, then use the programmatic SEO skill to cluster the ideas by intent into a prioritized content map. For each cluster show total search volume and difficulty, and recommend which clusters to build content for first. This is read-only research; do not claim anything was published.";
