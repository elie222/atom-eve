import { defineAgent } from "@flue/runtime";
import { draftArticle } from "../tools/blog-writer/article.js";
import { blogWriterInstructions } from "../lib/agents/blog-writer/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: blogWriterInstructions,
  tools: [draftArticle]
}));
