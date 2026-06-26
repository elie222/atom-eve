export const keywordResearcherSmokePrompt = [
  "Research keywords for this project.",
  "",
  "Seeds: \"project management software\", \"task tracking\".",
  "Use the DataForSEO keyword research tool to pull search volume and difficulty, then cluster the ideas by intent into a prioritized content map.",
  "Return a read-only summary: per-cluster total search volume, average difficulty, and which clusters to target first. Do not claim anything was published."
].join("\n");

export const keywordResearcherToolName = "research_keywords";

export const expectedReplyPattern = /cluster/i;
