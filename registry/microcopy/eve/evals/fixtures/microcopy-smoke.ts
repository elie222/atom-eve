export const microcopySmokePrompt = [
  "Rewrite this empty-state copy for clarity and a friendly, concise voice.",
  "",
  "Copy type: empty-state",
  "Voice: friendly, concise, confident",
  "Strings:",
  '- "NO DATA AVAILABLE. An exception was returned by the server."',
  '- "Submit"',
  "",
  "Use the improve_copy planner to flag the clarity and voice issues first, then draft a rewrite for each string.",
  "Show each original beside your rewrite as a draft for operator approval; do not edit any product copy."
].join("\n");

export const microcopyEveToolName = "improve_copy";

export const microcopyReplyPattern = /rewrite|empty|copy|draft/i;
