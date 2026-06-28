import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";

// 09:00 UTC every Monday. Vercel evaluates cron in UTC.
export default defineSchedule({
  cron: "0 9 * * 1",
  async run({ receive, waitUntil, appAuth }) {
    waitUntil(
      receive(slack, {
        message:
          "Generate this week's revenue & churn pulse and post it to the channel.",
        target: { channelId: process.env.SLACK_PULSE_CHANNEL_ID ?? "C0000000000" },
        auth: appAuth,
      }),
    );
  },
});
