import { createAgent } from "flue";
import { agentBrowser } from "../tools/website-qa/agent-browser.js";
import { writeWebsiteQaReport } from "../tools/website-qa/write-qa-report.js";

export default createAgent({
  name: "website-qa",
  instructions:
    "Run browser-driven QA on a website or web app. Use agent-browser to navigate, inspect, interact with onboarding/signup flows, capture screenshots, and then write a concise Markdown QA report.",
  tools: [agentBrowser, writeWebsiteQaReport]
});
