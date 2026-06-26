import { defineTool } from "eve/tools";
import { reviewLoopsAudience, reviewLoopsAudienceInputSchema } from "../lib/loops.js";

export default defineTool({
  description: "Review the project's Loops mailing lists and return a draft-ready audience summary.",
  inputSchema: reviewLoopsAudienceInputSchema,
  async execute() {
    return reviewLoopsAudience();
  }
});
