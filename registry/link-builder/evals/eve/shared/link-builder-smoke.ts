export const linkBuilderSmokePrompt = [
  "Plan link building for this project.",
  "",
  "Topic: \"project management software\".",
  "Use the prospecting tool to generate qualified backlink and guest-post prospect types, then draft personalized outreach for each.",
  "Return a draft-first plan. Flag that the prospects are categories to research rather than verified live contacts, and do not claim anything was sent."
].join("\n");

export const linkBuilderToolName = "find_prospects";

export const expectedReplyPattern = /outreach/i;
