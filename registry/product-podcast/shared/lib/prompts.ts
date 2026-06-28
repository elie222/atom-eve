// Shared trigger prompt text for this project's product podcast agent. Keep schedules and workflows
// thin by importing these constants instead of inlining copies. The agent's behavior summary lives
// in shared/instructions.md.

export const weeklyPodcastPrompt =
  "Gather this project's product updates from the last week (changelog entries, shipped features, fixes, release notes), then call plan_episode with those update notes to draft the episode outline and audio plan. Write each segment's spoken script grounded only in those notes, and present the full episode script and audio plan as a draft for approval. Do not generate audio or publish anything automatically.";
