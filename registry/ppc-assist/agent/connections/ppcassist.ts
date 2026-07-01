import { defineOpenAPIConnection } from "eve/connections";

const WRITE_OPERATIONS = new Set([
  "set_product_cogs",
  "pause_campaign",
  "enable_campaign",
  "edit_campaign_budget",
  "update_campaign_placements",
  "update_campaign_bidding_strategy",
  "edit_keyword_bid",
  "pause_keyword",
  "add_target_to_campaign",
  "add_negative_keyword_to_ad_group",
  "add_negative_keyword_to_campaign",
  "add_negative_target_to_ad_group",
  "add_negative_target_to_campaign",
  "bulk_add_negatives",
  "validate_suggestion",
  "ignore_suggestion",
  "update_account_strategy",
]);

function isWriteOperation(toolName: string): boolean {
  for (const operation of WRITE_OPERATIONS) {
    if (toolName === operation || toolName.endsWith(`__${operation}`)) return true;
  }
  return false;
}

export default defineOpenAPIConnection({
  spec: "https://ppcassist.com/api/openapi.json",
  baseUrl: "https://ppcassist.com/api/mcp",
  description:
    "PPC Assist Amazon PPC account data and actions: stores, products, campaigns, keywords, search terms, strategies, suggestions, audits, bid estimates, and approval-gated account changes.",
  auth: {
    getToken: async () => {
      const token = process.env.PPC_ASSIST_API_TOKEN;
      if (!token) throw new Error("PPC_ASSIST_API_TOKEN is not set");
      return { token };
    },
  },
  operations: {
    allow: [
      "list_stores",
      "get_store_overview",
      "get_all_stores_overview",
      "get_products",
      "get_listing_details",
      "get_product_goals",
      "set_product_cogs",
      "get_campaigns",
      "get_campaign_details",
      "pause_campaign",
      "enable_campaign",
      "edit_campaign_budget",
      "update_campaign_placements",
      "update_campaign_bidding_strategy",
      "get_keywords_performance",
      "get_search_terms",
      "edit_keyword_bid",
      "pause_keyword",
      "add_target_to_campaign",
      "add_negative_keyword_to_ad_group",
      "add_negative_keyword_to_campaign",
      "add_negative_target_to_ad_group",
      "add_negative_target_to_campaign",
      "bulk_add_negatives",
      "list_strategies",
      "get_strategy_details",
      "list_applied_strategies",
      "get_campaigns_without_strategy",
      "get_products_without_campaigns",
      "get_suggestions",
      "validate_suggestion",
      "ignore_suggestion",
      "get_orders",
      "get_search_query_performance",
      "get_activity_report",
      "get_account_strategy",
      "update_account_strategy",
      "run_ppc_audit",
      "get_bid_estimates",
      "get_bid_impression_curve",
    ],
  },
  approval: ({ toolName }) => (isWriteOperation(toolName) ? "user-approval" : "not-applicable"),
});
