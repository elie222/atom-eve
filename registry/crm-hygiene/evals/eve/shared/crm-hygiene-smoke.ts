export const crmHygieneSmokePrompt = [
  "Run a CRM hygiene scan of our HubSpot contacts.",
  "",
  "Goal: read HubSpot contacts and return a cleanup report covering duplicate records, contacts missing required fields, and stale contacts.",
  "Use the HubSpot review tool to read contact data only. Present the findings as proposed cleanup tasks for operator approval. Do not merge, edit, or delete any record."
].join("\n");

export const requiredReplyPatterns = [
  /duplicate/i,
  /missing/i,
  /stale/i
] as const;

export const expectedReplyToken = /HubSpot/i;
