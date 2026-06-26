#!/usr/bin/env bash
set -euo pipefail

# Make the official PostHog CLI available in the sandbox. The CLI's `api`
# interface exposes PostHog's full MCP tool surface and handles auth via
# POSTHOG_CLI_API_KEY / POSTHOG_CLI_PROJECT_ID.
npm install -g @posthog/cli >/dev/null 2>&1 || true
posthog-cli --version || true
