import { reviewMessages as reviewDiscordMessages } from "../../lib/agents/community-support/discord.js";

export async function reviewMessages() {
  return reviewDiscordMessages();
}
