import { defineSchedule } from "eve/schedules";

export default defineSchedule({
  cron: "0 9 * * 1",
  markdown:
    "Review the pull requests merged into the configured GitHub repository since the latest release or tag, group them by change type, and draft user-facing release notes for operator approval. Use the GitHub CLI (`gh`) in the sandbox, reading with `gh release view`, `gh pr list --state merged`, and `gh pr view`/`gh pr diff`. Present the draft as Markdown with a section per change type and a short plain-language summary per entry. Stay read-only: do not publish a release or create a tag. If the token or target repo is missing, report that the run is blocked.",
});
