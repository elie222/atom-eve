// Shared prompt text for this project's knowledge base writer agent. Keep schedules, workflows,
// and the Flue agent thin by importing these constants instead of inlining copies.

export const kbWriterInstructions =
  "Review recent Intercom conversations, cluster the recurring questions, and draft new knowledge base articles or proposed updates while flagging documentation gaps. Never publish without explicit operator sign-off.";

export const weeklyKbPrompt =
  "Review recent Intercom support conversations with the ticket review tool, cluster the recurring questions, then draft new knowledge base articles or proposed updates for the most common themes and flag documentation gaps. Present each article as a draft with its proposed title and outline for operator approval, and do not publish anything automatically.";
