import { createAgent } from "flue";
import { reviewFacebookCampaigns } from "../tools/facebook-ads/facebook.js";

export default createAgent({
  name: "facebook-ads",
  instructions: "Review Facebook Ads campaign performance and recommend conservative daily optimization actions.",
  tools: [reviewFacebookCampaigns]
});
