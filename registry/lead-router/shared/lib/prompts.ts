// Shared trigger prompt text for this project's Lead Router agent. Keep schedules and
// workflows thin by importing these constants instead of inlining copies. The agent's behavior
// now lives in shared/instructions.md.

export const dailyRoutingPrompt =
  "Read the most recent inbound HubSpot contacts with the lead review tool, score each by ICP fit and intent, and present a draft owner assignment and first-touch message per lead for operator approval. Do not assign owners, change lifecycle stages, or send anything automatically.";
