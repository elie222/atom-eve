# Error Copy

## What it does

Turns your app's error messages into clearer, more empathetic copy, with each error state confirmed reachable first.

Drives your app in a real browser to surface user-facing error states:
- form validation errors
- HTTP error pages (404, 403, 500, maintenance)
- empty and zero-result views
- permission denials
- failed-action toasts and banners

For each one it records the verbatim copy, the URL and trigger steps, a screenshot as evidence, and whether the state is actually reachable or only theoretical. You get a Markdown report with before/after rewrite drafts, each with its rationale.

It records and proposes only: it never edits code, copy, or configuration, never uses real credentials or payment, and never bypasses CAPTCHA.

## Setup

Set the app URLs, flows, brand voice, and copy guidelines in `agent/instructions.md`. For authenticated flows, point it at local env or config notes that list them, and keep credentials out of this package.
