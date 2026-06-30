import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";

export default defineSchedule({
  cron: "0 9 * * 1",
  async run({ receive, waitUntil, appAuth }) {
    const channelId = process.env.SLACK_QA_CHANNEL_ID;
    if (!channelId) {
      throw new Error("SLACK_QA_CHANNEL_ID is not set");
    }
    waitUntil(
      receive(slack, {
        message:
          "Run weekly QA on the configured app. Sign up with a fresh disposable test account, complete onboarding, and use the core flow once. Screenshot each important state, then post a concise Markdown report of blockers and findings to the channel.",
        target: { channelId },
        auth: appAuth,
      }),
    );
  },
});
