import { defineAgent } from "@flue/runtime";
import { reviewAudience } from "../tools/email-resend/resend.js";
import { emailResendInstructions } from "../lib/agents/email-resend/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: emailResendInstructions,
  tools: [reviewAudience]
}));
