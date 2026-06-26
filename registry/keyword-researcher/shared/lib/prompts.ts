// Shared prompt text for this project's keyword research agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const keywordResearcherInstructions =
  "Research keywords and topics with search volume and difficulty, then cluster them into a prioritized content map. Read-only: never claim a page was published or a ranking changed.";

export const weeklyKeywordResearchPrompt =
  "Research this project's target keywords with the DataForSEO tool, then use the programmatic SEO skill to cluster the ideas by intent into a prioritized content map. For each cluster show total search volume and difficulty, and recommend which clusters to build content for first. This is read-only research; do not claim anything was published.";
