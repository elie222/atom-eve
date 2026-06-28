// Shared trigger prompt text for this project's knowledge base writer agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const weeklyKbPrompt =
  "Review recent Intercom support conversations with the ticket review tool, cluster the recurring questions, then draft new knowledge base articles or proposed updates for the most common themes and flag documentation gaps. Present each article as a draft with its proposed title and outline for operator approval, and do not publish anything automatically.";
