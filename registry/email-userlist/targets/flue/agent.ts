import { defineAgent } from "@flue/runtime";
import { planCampaign } from "../tools/email-userlist/userlist.js";
import { emailUserlistInstructions } from "../lib/agents/email-userlist/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: emailUserlistInstructions,
  tools: [planCampaign]
}));
