export const creativeStudioSmokePrompt = [
  "Generate 3 image creative variants for this brief:",
  "",
  "Brief: A bold, minimal product hero shot for a new cold-brew coffee can, bright studio lighting, social-ad ready.",
  "",
  "Use the creative generation tool, then return the image URLs as drafts with a short rationale for each variant. Do not publish anything; these are for operator approval only."
].join("\n");

export const generateCreativeToolName = "generate_creative";

export const expectedReplyPatterns = [/draft/i, /approval/i] as const;
