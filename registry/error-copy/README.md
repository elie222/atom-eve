# Error Copy

## What it does

Drives your app in a real browser to surface user-facing error states: form validation errors, HTTP error pages (404, 403, 500, maintenance), empty and zero-result views, permission denials, and failed-action toasts and banners. For each one it records the verbatim copy, the URL and trigger steps, a screenshot saved under `reports/error-copy/artifacts/`, and whether the state is actually reachable or only theoretical. You get a Markdown report with before/after rewrite drafts that improve clarity, tone, and next-step guidance, each with its rationale.

## Setup

Set the app URLs, flows, brand voice, and copy guidelines in `agent/instructions.md`. For authenticated flows, point it at local env or config notes that list them; keep credentials and session state out of this package.

It is draft-first: it records errors and proposes rewrites but never edits code, copy, or configuration, never uses real credentials or payment, and never bypasses CAPTCHA.
