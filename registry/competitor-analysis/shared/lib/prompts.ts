// Trigger prompt for this project's competitor analysis schedule. Agent behavior now lives in
// shared/instructions.md.

export const weeklyCompetitorAnalysisPrompt =
  "Run the weekly competitor analysis for the configured competitor URLs. Use native fetch/browser/sandbox capabilities, compare against reports/competitor-analysis/history when available, save report artifacts, and summarize notable deltas.";
