import { defineTool } from "eve/tools";
import {
  reviewUserlistPlan,
  normalizeReviewUserlistPlanInput,
  reviewUserlistPlanInputSchema
} from "../lib/userlist.js";

export default defineTool({
  description: "Plan the events and traits to push for a Userlist lifecycle stage and return a draft-ready campaign plan.",
  inputSchema: reviewUserlistPlanInputSchema,
  async execute(input: unknown) {
    return reviewUserlistPlan(normalizeReviewUserlistPlanInput(input));
  }
});
