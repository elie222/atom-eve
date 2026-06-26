import { defineTool } from "eve/tools";
import { checkEndpoints, checkEndpointsInputSchema, normalizeCheckEndpointsInput } from "../lib/uptime.js";

export default defineTool({
  description: "Check operator-supplied endpoints for HTTP status, latency, and expected content, returning a read-only health report.",
  inputSchema: checkEndpointsInputSchema,
  async execute(input: unknown) {
    return checkEndpoints(normalizeCheckEndpointsInput(input));
  }
});
