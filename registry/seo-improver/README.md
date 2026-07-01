# SEO Improver

## What it does

Runs a weekly ranking loop. It pulls current positions for your tracked keywords from DataForSEO, compares them to the previous run to show what moved, and finds the highest-leverage opportunities: keywords in striking distance of page one, titles that lose clicks they already earn, cannibalized pages, and pages that are decaying. For each one it inspects the ranking page in a real browser and hands back a specific, ready-to-apply change tied to the ranking evidence. The next week it checks whether last week's changes were made and whether positions responded, so recommendations compound instead of repeat.

It keeps the run read-only against your live site. If your blog lives on GitHub, it can go one step further and open a pull request with the highest-confidence changes for you to review and merge, so recommendations actually ship. It never pushes to your default branch and never merges.

## Setup

1. Create DataForSEO API credentials with SERP and Labs (ranked keywords) access, and set `DATAFORSEO_LOGIN` and `DATAFORSEO_PASSWORD`.
2. In `agent/instructions.md`, set your domain, the keywords to track (or let it derive them from your ranked keywords), and target locale/device.
3. Optionally feed Google Search Console data (an export or first-party impressions/clicks/CTR) for real click-based opportunity analysis on your own pages. It runs on DataForSEO alone without it.
4. Optional blog editing: if your blog is on GitHub, set the repo (`owner/repo` and the content path) in `agent/instructions.md` and provide `GITHUB_TOKEN` with write access. The agent then opens a review-ready pull request each run. Leave it unset to stay report-only, or wire your own publishing path if the blog is on a hosted CMS.

Runs on a weekly schedule (`agent/schedules/weekly.ts`, Mondays 09:00). History accumulates under `reports/seo-improver/`, which is what makes the week-over-week diff work, so keep it around between runs.
