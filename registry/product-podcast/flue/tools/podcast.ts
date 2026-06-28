import { planPodcastEpisode, normalizePlanEpisodeInput } from "../../lib/agents/product-podcast/podcast.js";

export async function planEpisode(input?: unknown) {
  return planPodcastEpisode(normalizePlanEpisodeInput(input));
}
