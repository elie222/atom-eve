#!/usr/bin/env bash
set -euo pipefail

if [ -f .posthog-cli-ready ]; then
  posthog-cli --version || true
  exit 0
fi

npm install -g @posthog/cli >/dev/null 2>&1 || true
posthog-cli --version || true

touch .posthog-cli-ready
