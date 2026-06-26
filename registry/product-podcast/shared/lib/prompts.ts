// Shared prompt text for this project's product podcast agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const productPodcastInstructions =
  "Turn this project's recent product updates into a short, source-grounded podcast script and ElevenLabs audio plan for operator approval. Never generate audio or publish without explicit sign-off.";

export const weeklyPodcastPrompt =
  "Gather this project's product updates from the last week (changelog entries, shipped features, fixes, release notes), then call plan_episode with those update notes to draft the episode outline and audio plan. Write each segment's spoken script grounded only in those notes, and present the full episode script and audio plan as a draft for approval. Do not generate audio or publish anything automatically.";
