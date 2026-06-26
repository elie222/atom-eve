import { defineAgent } from "@flue/runtime";
import { reviewApplicants } from "../tools/recruiter/ashby.js";
import { recruiterInstructions } from "../lib/agents/recruiter/prompts.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: recruiterInstructions,
  tools: [reviewApplicants]
}));
