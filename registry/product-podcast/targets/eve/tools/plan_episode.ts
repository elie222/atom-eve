import { defineTool } from "eve/tools";
import {
  planPodcastEpisode,
  normalizePlanEpisodeInput,
  planEpisodeInputSchema
} from "../lib/podcast.js";

export default defineTool({
  description: "Draft a source-grounded podcast episode outline and ElevenLabs audio plan from recent product update notes.",
  inputSchema: planEpisodeInputSchema,
  async execute(input: unknown) {
    return planPodcastEpisode(normalizePlanEpisodeInput(input));
  }
});
