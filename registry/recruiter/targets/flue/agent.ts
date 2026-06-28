import { defineAgent } from "@flue/runtime";
import { reviewApplicants } from "../tools/recruiter/ashby.js";

export default defineAgent(() => ({
  model: "anthropic/claude-sonnet-4-6",
  cwd: "/workspace",
  instructions: "__ATOM_INSTRUCTIONS__",
  tools: [reviewApplicants]
}));
