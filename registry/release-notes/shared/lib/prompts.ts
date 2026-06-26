// Shared prompt text for this project's release notes agent. Keep schedules, workflows, and the
// Flue agent thin by importing these constants instead of inlining copies.

export const releaseNotesInstructions =
  "Review the pull requests merged since the latest release and draft user-facing release notes grouped by change type for operator approval. Never publish a release or create a tag automatically.";

export const weeklyReleaseNotesPrompt =
  "Review the pull requests merged since the latest release, group them by change type, and draft user-facing release notes for operator approval. Present the draft as Markdown with a section per change type and a short plain-language summary per entry. Do not publish a release or create a tag.";
