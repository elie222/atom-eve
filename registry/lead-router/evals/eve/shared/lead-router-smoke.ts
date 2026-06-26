export const leadRouterSmokePrompt = [
  "Review our recent inbound HubSpot contacts and draft routing for the sales team.",
  "",
  "Goal: read recent contacts, score each by ICP fit and intent, then present a draft owner assignment and first-touch message per lead for operator approval.",
  "Use the lead review tool to read contacts only. Present each lead with its score and a draft. Do not assign owners, change lifecycle stages, or send outreach."
].join("\n");

export const requiredReplyPatterns = [
  /score|icp|intent/i,
  /draft/i,
  /assign/i
] as const;

export const expectedReplyToken = /HubSpot/i;
