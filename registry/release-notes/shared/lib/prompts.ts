// Shared prompt text for this project's release notes agent. Keep schedules and workflows thin by
// importing these trigger constants instead of inlining copies. Agent behavior lives in
// shared/instructions.md.

export const weeklyReleaseNotesPrompt =
  "Review the pull requests merged since the latest release, group them by change type, and draft user-facing release notes for operator approval. Present the draft as Markdown with a section per change type and a short plain-language summary per entry. Do not publish a release or create a tag.";
