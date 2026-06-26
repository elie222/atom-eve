export const buyerVoiceSmokePrompt = [
  "Mine these buyer objections and draft landing-page copy in the customers' own words.",
  "",
  "Page: homepage hero and pricing section",
  "Objections:",
  "- It looks too expensive for what we get.",
  "- I'm not sure I can trust a tool I've never heard of.",
  "- Setup looks like it would take too long.",
  "- We already use a competitor and switching seems hard.",
  "- The pricing is confusing and feels like a risk.",
  "",
  "Use the draft_copy planner to cluster the objections first, then rewrite the scaffolds. Present them as drafts for approval; do not edit or publish any page."
].join("\n");

export const buyerVoiceEveToolName = "draft_copy";

export const buyerVoiceReplyPattern = /objection|copy|draft/i;
