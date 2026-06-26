export const thumbnailStudioSmokePrompt = [
  'Generate 3 thumbnail concepts for a YouTube video titled "How to bake sourdough bread at home".',
  "",
  "Score each concept for clarity and clickbait risk, and tell me which ones clear the bar.",
  "This is draft-first: return the concept image URLs and your self-scored rationale for my approval. Do not publish, upload, or set any thumbnail."
].join("\n");

export const thumbnailToolName = "generate_thumbnails";

export const expectedReplyToken = /clarity/i;
