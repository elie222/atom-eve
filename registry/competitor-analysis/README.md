# Competitor Analysis Agent

## What it does

The Competitor Analysis Agent is a weekly market monitoring agent for teams that want a repeatable view of competitor website changes without paying for search or market intelligence APIs.

It reviews configured competitor URLs and reports changes in:

- Positioning and headline/message hierarchy
- Pricing and packaging
- Feature messaging
- CTA flow and conversion path
- Blog, docs, changelog, landing page, or resource content
- Screenshots and saved artifacts
- Notable deltas from prior runs

The MVP uses the target framework's native browser, fetch, and sandbox command capabilities. It does not install or call a custom browser wrapper tool and does not rely on paid search APIs.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add competitor-analysis --target flue
```

or:

```bash
npx atom-eve add competitor-analysis --target eve
```

## Setup

Configure competitor URLs in the prompt you send to the agent, or keep them in your app's local env/config notes and reference those notes from the prompt. For example:

```text
Run the weekly competitor analysis for:
- Acme: https://acme.example/pricing, https://acme.example/product
- ExampleCRM: https://example-crm.example/, https://example-crm.example/changelog
```

No API keys are required. If a site requires authentication, configure access in your own project and keep credentials out of this registry package.

The Eve target includes a lightweight sandbox bootstrap that creates:

```text
reports/competitor-analysis/history
reports/competitor-analysis/artifacts
```

For Flue, create equivalent directories in the sandbox or let the first run create them with native command execution.

## Usage

Run the weekly schedule or ask the agent directly:

```text
Run the weekly competitor analysis.

Competitors:
- Acme: https://acme.example/, https://acme.example/pricing
- ExampleCRM: https://example-crm.example/, https://example-crm.example/features

Compare against reports/competitor-analysis/history if any prior runs exist. Capture screenshots for changed or strategically important pages and write a new Markdown report plus a compact JSON snapshot.
```

The agent should use native capabilities available in the host framework:

- Use fetch or sandbox commands such as `curl` or `node -e` to collect page text and metadata.
- Use the framework's browser capability for pages where layout, screenshots, dynamic content, or CTA flow matter.
- Store screenshots and raw artifacts under `reports/competitor-analysis/artifacts/<run-id>/`.
- Store the report and compact snapshot under `reports/competitor-analysis/history/<run-id>/`.

Return a concise Markdown report with:

1. Executive summary
2. Competitors and URLs reviewed
3. Positioning changes
4. Pricing and packaging changes
5. Feature messaging and content changes
6. CTA flow changes
7. Screenshots and artifacts
8. Notable deltas from prior runs
9. Follow-up questions or recommended actions

## Connections and auth

This package has no external service connection and no required environment variables.

Users provide competitor URLs in the prompt or in local env/config notes. For authenticated competitor portals, wire access in your application and document the allowed access policy locally.

## Limitations

- The MVP only compares against files available in `reports/competitor-analysis/history/...`.
- Local history can be lost when sandboxes are ephemeral. DB-backed history, object storage for screenshots, Slack or email delivery, and external vector/search storage are future work.
- The agent does not discover competitors or URLs through paid search APIs.
- Screenshots and dynamic page capture depend on the target framework's native browser capability being available.
