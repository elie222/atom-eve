import { defineSchedule } from "eve/schedules";

import slack from "../channels/slack.js";

// 10:00 UTC every Monday. Vercel evaluates cron in UTC.
export default defineSchedule({
  cron: "0 10 * * 1",
  async run({ receive, waitUntil, appAuth }) {
    const channelId = process.env.SLACK_POSTIZ_CHANNEL_ID;
    if (!channelId) {
      throw new Error("SLACK_POSTIZ_CHANNEL_ID is not set");
    }
    waitUntil(
      receive(slack, {
        message:
          "Run the weekly content flywheel for the configured site: research, review results since the last run, draft this week's approval-ready posts as Postiz drafts, and post the plan to the channel for review.",
        target: { channelId },
        auth: appAuth,
      }),
    );
  },
});
