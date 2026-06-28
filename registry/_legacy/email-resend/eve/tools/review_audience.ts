import { defineTool } from "eve/tools";
import { reviewResendAudience, reviewResendAudienceInputSchema } from "../lib/resend.js";

export default defineTool({
  description: "Review the project's Resend audiences and return a draft-ready audience summary.",
  inputSchema: reviewResendAudienceInputSchema,
  async execute() {
    return reviewResendAudience();
  }
});
