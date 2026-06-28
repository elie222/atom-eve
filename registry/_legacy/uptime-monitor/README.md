# Uptime Monitor Agent

## What it does

Checks the endpoints you give it for availability and returns a read-only health report. For each endpoint the agent performs a GET-style fetch and records the HTTP status, response latency, and (when you specify one) whether the response body contains an expected content substring. Each result is graded `ok`, `warn` (slow, or missing expected content), or `down` (request failed, timed out, or returned an unexpected status).

The agent is monitoring-only. It never restarts services, redeploys, scales, or opens tickets, and it does not claim to have remediated anything. The single custom tool only reads.

## Supported targets

- Eve
- Flue

## Install

```bash
npx atom-eve add uptime-monitor
```

Target overrides:

```bash
npx atom-eve add uptime-monitor --target eve
npx atom-eve add uptime-monitor --target flue
```

## Setup

No API keys or environment variables are required. The agent uses the runtime's native `fetch` to reach the URLs you provide.

Configure the endpoints you want watched in your prompt or in your agent's local config notes. The `check_endpoints` tool accepts a `urls` array where each item is either:

- an absolute `http(s)` URL string, or
- an object `{ "url": "...", "expectedStatus": 200, "expectedContent": "..." }`.

An optional `timeoutMs` (default `10000`) controls the per-request timeout.

## Usage

Run the agent manually with the endpoints you want checked, or wire the installed frequent schedule/workflow into your deployment:

- Eve installs as the root agent under `agent/`, including `agent/schedules/frequent.ts` (cron `*/15 * * * *`).
- Flue installs an agent plus `src/workflows/uptime-monitor-frequent.ts`.

The schedule and workflow trigger the agent to check this project's configured endpoints and summarize the health report. Edit the installed instructions and schedule prompt to point at your real endpoints; the agent stops cleanly if no endpoints are configured.

## Connections and auth

This package declares no connections and no required environment variables. It uses the framework-native `fetch` integration to reach public endpoints, so there is nothing to authenticate. If you need to monitor authenticated endpoints, add your own headers/credentials handling in a tool you control.

## Limitations

- Read-only: the tool performs GET-style fetches only. It does not restart, redeploy, scale, or remediate anything.
- It checks status, latency, and an optional content substring; it does not validate TLS certificates, run synthetic multi-step flows, or measure from multiple regions.
- Endpoints must be absolute `http(s)` URLs that the runtime can reach directly; private or VPN-only hosts will report as down.
- Latency is measured from the runtime that executes the check and is a single-sample reading, not an SLA-grade metric.
