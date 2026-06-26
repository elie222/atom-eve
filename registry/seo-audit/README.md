# SEO Audit Agent

## What it does

The SEO Audit Agent reviews a public website, page, or sitemap for practical SEO and content issues. It fetches pages, optionally opens key pages in a browser through the framework sandbox, compares the current run with file or blob-backed history, and returns or writes a concise Markdown report.

The package checks:

- Titles and meta descriptions.
- Heading structure.
- Canonical and robots signals.
- Broken content, broken CTAs, and unclear conversion paths.
- Content gaps and visible copy quality.
- Internal links and obvious broken-link risks.
- Previous-vs-current deltas from the configured memory backend.

History is intentionally file-backed by default. The agent writes snapshots and reports under `reports/seo-audit/history/...` in the sandbox or repo. For durable memory across ephemeral sandboxes, wire the shared blob-memory helpers to Vercel Blob, Cloudflare R2, S3-compatible storage, or another object store. This package does not require SQL tables or migrations.

The package includes:

- Shared SEO audit instructions.
- Shared memory helpers under `shared/lib/memory.ts` and SEO memory paths under `shared/lib/seo-memory.ts`.
- An Eve root agent, weekly schedule, and sandbox bootstrap for report/history directories.
- A Flue agent and weekly workflow trigger.

It does not add paid APIs or custom browser wrapper tools. The agent should use the target framework's native sandbox command, browser, and fetch capabilities where available.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add seo-audit --target flue
```

or:

```bash
npx atom-eve add seo-audit --target eve
```

## Setup

No credentials are required for public pages.

Before enabling a recurring run, configure the production URL or sitemap in your app repo. The installed weekly schedule/workflow intentionally uses a generic trigger; if no URL is configured, the agent should report the run as blocked instead of auditing a sample domain.

For Eve:

```text
agent/schedules/weekly.ts
```

For Flue:

```text
src/workflows/seo-audit-weekly.ts
```

Make sure the runtime sandbox can make outbound HTTP requests and write local files under `reports/seo-audit/history`, or configure a blob-backed memory adapter in your app. If browser inspection is available in your framework, use it for visible copy, layout, and CTA checks. If browser inspection is unavailable, continue with fetch-based checks and note the limitation in the report.

## Memory

The default memory backend is the local filesystem:

```text
reports/seo-audit/latest.md
reports/seo-audit/history/YYYY-MM-DDTHH-mm-ssZ.md
reports/seo-audit/history/YYYY-MM-DDTHH-mm-ssZ.json
```

Blob-backed memory uses the same small-file mental model, but stores it in object storage:

```text
atom-eve/seo-audit/sites/<site>/
  latest.json
  latest.md
  index.json
  runs/<run-id>/
    summary.json
    report.md
    pages.json
    issues.json
```

Listing by prefix is expected. This agent saves a few reports for itself, so it does not need a query engine for the common case. Keep `index.json` compact if you want a quick summary, but it is fine to list `runs/` directly.

### Vercel Blob

For Eve on Vercel, install and connect Vercel Blob in the host app:

```bash
pnpm add @vercel/blob
vercel blob create-store seo-audit-memory --access private
vercel env pull
```

Then wire the installed helper to the Blob SDK from your app code if you want a programmatic memory tool or workflow helper:

```ts
import { del, get, list, put } from "@vercel/blob";
import { createVercelBlobClient } from "./agent/lib/memory.js";
import { createSeoAuditMemoryStore } from "./agent/lib/seo-memory.js";

const blobClient = createVercelBlobClient({
  async getText(pathname) {
    const result = await get(pathname, { access: "private" });
    if (!result || result.statusCode === 304 || !result.stream) return null;
    return new Response(result.stream).text();
  },
  put,
  list,
  del
});

export const seoMemory = createSeoAuditMemoryStore({
  client: blobClient,
  siteUrl: "https://your-site.com"
});
```

### Cloudflare R2

For Flue on Cloudflare, bind an R2 bucket in the host app and pass the binding to the shared adapter:

```jsonc
{
  "r2_buckets": [
    {
      "binding": "SEO_AUDIT_MEMORY",
      "bucket_name": "seo-audit-memory"
    }
  ]
}
```

```ts
import { createR2BlobClient, type R2LikeBucket } from "../lib/agents/seo-audit/memory.js";
import { createSeoAuditMemoryStore } from "../lib/agents/seo-audit/seo-memory.js";

export function createSeoMemory(env: { SEO_AUDIT_MEMORY: R2LikeBucket }) {
  return createSeoAuditMemoryStore({
    client: createR2BlobClient(env.SEO_AUDIT_MEMORY),
    siteUrl: "https://your-site.com"
  });
}
```

Installed agents still work without these snippets. Blob memory is an opt-in durability upgrade for hosts with ephemeral sandboxes.

## Usage

Send the agent a URL or sitemap:

```text
Audit https://your-site.com/sitemap.xml.

Sample up to 25 indexable URLs, inspect homepage and top content pages in a browser if available, compare against prior history, and write the Markdown report to reports/seo-audit/latest.md.
```

For a single page:

```text
Audit https://your-site.com/pricing.

Check metadata, headings, canonical and robots signals, internal links, CTA clarity, visible copy quality, and content gaps. Compare with the previous run if history exists.
```

The agent should return a concise Markdown report and, when filesystem access is available, write:

```text
reports/seo-audit/latest.md
reports/seo-audit/history/YYYY-MM-DDTHH-mm-ssZ.md
reports/seo-audit/history/YYYY-MM-DDTHH-mm-ssZ.json
```

The JSON file should contain the lightweight observations needed for the next delta comparison, not raw page dumps. When using blob memory, write the equivalent compact JSON and Markdown files under the `atom-eve/seo-audit/sites/<site>/` prefix.

## Local Smoke Test

Install into a fixture app and run type checks:

```bash
npx atom-eve init --target eve --runtime vercel
npx atom-eve add seo-audit --target eve
pnpm install
pnpm typecheck
```

Then send a safe prompt:

```text
Audit https://your-site.com. Keep the run read-only and write the report to reports/seo-audit/latest.md.
```

## Updating An Installed Copy

Rerun the add command from your app repo and review the diff:

```bash
npx atom-eve add seo-audit --target eve
git diff
```

Treat installed files like shadcn components: keep local URL, schedule, retention, and reporting customizations that still matter.

## Connections and auth

This package has no required connections and no required environment variables.

Optional durable memory may require host-specific configuration:

- Vercel Blob: `BLOB_READ_WRITE_TOKEN` or Vercel OIDC plus `BLOB_STORE_ID`, depending on how the store is connected.
- Cloudflare R2: an R2 bucket binding such as `SEO_AUDIT_MEMORY`.

For private sites, configure authenticated fetch or browser session handling in your app repo. Do not commit cookies, browser profile state, or credentials.

## Limitations

- Local file history under `reports/seo-audit/history` can be lost when the runtime sandbox is ephemeral. Use blob-backed memory when reports must survive across runs.
- It is not a crawler at search-engine scale. Keep sitemap samples bounded unless you add queueing and rate controls.
- JavaScript-heavy pages may need a browser-capable sandbox for reliable visible-copy and CTA checks.
- Robots and sitemap interpretation is best-effort and should be reviewed before making high-impact indexing changes.
