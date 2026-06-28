export const researchAssistantSmokePrompt = [
  "Research this question and write a sourced brief: which HTTP caching strategy should a small SaaS use for a public marketing site served from a CDN?",
  "",
  "Decision: we need to pick a caching approach this week.",
  "Use native web search and fetch to find primary, authoritative sources, verify each material claim against the source, and note dates.",
  "Stay read-only: do not change any config or claim you deployed anything. Return a concise Markdown brief with a clear bottom line, cited findings, confidence and gaps, a numbered Sources list of URLs, and recommended next steps."
].join("\n");

export const expectedReplyPattern = /caching/i;

export const requiredBriefSectionPatterns = [
  /Bottom Line/i,
  /Key Findings/i,
  /Confidence (and|&)\s*Gaps/i,
  /Sources/i,
  /Recommended Next Steps/i
] as const;
