#!/usr/bin/env bash
set -euo pipefail

# Ensure a posthog-cli that has the `api` subcommand (older releases lack it).
if posthog-cli api --help >/dev/null 2>&1; then
  exit 0
fi

npm install -g @posthog/cli@latest
if ! posthog-cli api --help >/dev/null 2>&1; then
  echo "posthog-cli installed but missing the 'api' subcommand; a newer @posthog/cli is required." >&2
  exit 1
fi
