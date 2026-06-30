import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 11 * * 1",
  markdown:
    "Run the weekly docs sync for the configured GitHub repository. Use the GitHub CLI in the sandbox to inspect recent merged changes, source files, config schemas, examples, and docs paths. Stay read-only by default and return a concise Markdown report with docs drift findings, concrete draft edits, and a suggested PR title and body. If the token, target repo, docs paths, or source paths are missing, report that the run is blocked.",
});
