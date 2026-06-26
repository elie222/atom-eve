import { reviewUpdates as reviewChannelUpdates } from "../../lib/agents/standup-bot/slack.js";

export async function reviewUpdates() {
  return reviewChannelUpdates();
}
