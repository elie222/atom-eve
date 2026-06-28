import { reviewApplicants as reviewApplicantsImpl } from "../../lib/agents/recruiter/ashby.js";

export async function reviewApplicants() {
  return reviewApplicantsImpl();
}
