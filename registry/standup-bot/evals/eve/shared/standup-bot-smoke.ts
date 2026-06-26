export const standupBotSmokePrompt = [
  "Read our Slack channel and draft today's standup digest.",
  "",
  "Goal: read recent channel updates, then present a draft standup digest with sections for priorities, active threads, and wins.",
  "Use the Slack review tool to read channel history only. Present the digest as a draft for operator approval. Do not post anything back to Slack."
].join("\n");

export const requiredReplyPatterns = [
  /priorit/i,
  /thread/i,
  /win/i,
  /draft/i
] as const;

export const expectedReplyToken = /standup/i;
