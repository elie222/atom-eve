import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 10 * * 1",
  markdown:
    "Run the weekly dependency guardian triage for the configured GitHub repository. Use the GitHub CLI in the sandbox to read dependency update PRs, Dependabot alerts, manifests, lockfiles, and relevant release or advisory context. Stay read-only and return a prioritized Markdown report separating urgent reachable security work from routine updates, with verification steps and blockers. If the token or target repo is missing, report that the run is blocked.",
});
