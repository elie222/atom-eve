import {
  planLogging as runPlanLogging,
  normalizePlanLoggingInput
} from "../../lib/agents/logging-coverage/logging.js";

export async function planLogging(input?: unknown) {
  return runPlanLogging(normalizePlanLoggingInput(input));
}
