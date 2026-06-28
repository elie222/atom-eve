export const xGrowthSmokePrompt = [
  "Monitor X for mentions of the brand \"acme\" and draft engagement.",
  "",
  "Goal: find recent relevant mentions and draft replies plus a few original post ideas.",
  "Use the search_mentions tool with an appropriate query to read recent mentions, then return reply drafts and post ideas for operator approval.",
  "Do not post, reply, like, or follow anything."
].join("\n");

export const expectedApprovalToken = /approval/i;
