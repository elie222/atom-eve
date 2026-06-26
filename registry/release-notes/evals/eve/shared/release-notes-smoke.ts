export const releaseNotesSmokePrompt = [
  "Draft release notes for the changes merged since our latest release.",
  "",
  "Goal: read the pull requests merged since the latest release, group them by change type, then present draft release notes for operator approval.",
  "Use the merged pull request review tool to read GitHub data only. Present the notes as a Markdown draft grouped by change type. Do not publish a release or create a tag."
].join("\n");

export const requiredReplyPatterns = [/release notes/i, /merged/i, /draft/i] as const;

export const expectedReplyToken = /pull request/i;
