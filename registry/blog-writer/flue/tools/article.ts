import { draftArticle as buildArticleDraft, normalizeDraftArticleInput } from "../../lib/agents/blog-writer/article.js";

export async function draftArticle(input?: unknown) {
  return buildArticleDraft(normalizeDraftArticleInput(input));
}
