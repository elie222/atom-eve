export const productPodcastSmokePrompt = [
  "Draft this week's product update podcast from these recent update notes:",
  "- Added dark mode to the dashboard.",
  "- Fixed a bug where CSV exports dropped the last row.",
  "- Shipped SSO support for enterprise workspaces.",
  "",
  "Call plan_episode with these notes, then write each segment's spoken script grounded only in the notes.",
  "Present the full episode script and audio plan as a draft for approval. Do not generate audio or publish anything."
].join("\n");

export const planEpisodeToolName = "plan_episode";

export const draftReplyPatterns = [/draft/i, /script/i] as const;
