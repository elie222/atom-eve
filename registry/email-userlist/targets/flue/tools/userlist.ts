import { reviewUserlistPlan } from "../../lib/agents/email-userlist/userlist.js";

export async function planCampaign() {
  return reviewUserlistPlan();
}
