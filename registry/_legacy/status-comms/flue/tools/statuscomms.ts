import { planIncidentComms } from "../../lib/agents/status-comms/statuscomms.js";

export async function draftIncidentUpdate() {
  return planIncidentComms();
}
