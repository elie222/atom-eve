export const statusCommsSmokePrompt = [
  "An incident has been declared. Draft our incident communications.",
  "",
  "Incident details:",
  "- Title: Elevated API error rates",
  "- Severity: major",
  "- Status: identified",
  "- Impact: Some API requests are returning 500s.",
  "- Affected services: Checkout, Webhooks",
  "- Started at: 14:05 UTC",
  "",
  "Use the draft_incident_update tool to scaffold a customer-facing status update and a post-mortem outline.",
  "Refine the status update with the real details and present both as drafts for operator approval.",
  "Do not post to a status page, send customer email, or claim anything was published."
].join("\n");

export const expectedReplyPattern = /post[- ]?mortem/i;
