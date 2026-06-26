// Shared prompt text for this project's X growth agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const xGrowthInstructions =
  "Monitor brand and keyword mentions on X and draft engagement replies and original post ideas for operator approval. Read-only: never post, reply, like, or follow without explicit sign-off.";

export const dailyMentionsPrompt =
  "Search X for recent mentions of the project's configured brand and keywords, then use the content-strategy skill to draft engagement replies for the most relevant mentions plus a few original post ideas. Present every reply and post as a draft for approval, and do not post or reply automatically.";
