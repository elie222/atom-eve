#!/usr/bin/env bash
set -euo pipefail

if command -v posthog-cli >/dev/null 2>&1; then
  posthog-cli --version || true
  exit 0
fi

npm install -g @posthog/cli >/dev/null 2>&1 || true
posthog-cli --version || true
