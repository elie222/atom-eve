import { defineAgent } from "@flue/runtime";
import { draftArticle } from "../tools/blog-writer/article.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [draftArticle]
}));
