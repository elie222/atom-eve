import { createWorkflow } from "flue";
import { reviewFacebookCampaigns } from "../tools/facebook-ads/facebook";

export default createWorkflow({
  name: "facebook-ads-daily",
  async run() {
    return reviewFacebookCampaigns();
  }
});
