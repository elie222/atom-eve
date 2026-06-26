import { checkEndpoints as runCheckEndpoints, normalizeCheckEndpointsInput } from "../../lib/agents/uptime-monitor/uptime.js";

export async function checkEndpoints(input: unknown) {
  return runCheckEndpoints(normalizeCheckEndpointsInput(input));
}
