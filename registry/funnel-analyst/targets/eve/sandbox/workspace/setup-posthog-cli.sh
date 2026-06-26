#!/usr/bin/env bash
set -euo pipefail

npm install -g @posthog/cli >/dev/null 2>&1 || true
posthog-cli --version || true
