import { defineTool } from "eve/tools";
import { draftArticle, draftArticleInputSchema, normalizeDraftArticleInput } from "../lib/article.js";

export default defineTool({
  description:
    "Plan a long-form SEO article from a keyword brief and return an outline, draft scaffold with internal-link suggestions, and on-page SEO checks.",
  inputSchema: draftArticleInputSchema,
  async execute(input: unknown) {
    return draftArticle(normalizeDraftArticleInput(input));
  }
});
