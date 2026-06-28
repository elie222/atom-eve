#!/usr/bin/env bash
# Seeded helper: query PostHog engagement for a customer.
# Lands at /workspace/scripts/engagement.sh in the sandbox.
# Usage: scripts/engagement.sh <customer_id>
#
# posthog-cli is @posthog/cli; HogQL runs through `exp query run`, which prints
# JSON lines. Auth via POSTHOG_CLI_API_KEY + POSTHOG_CLI_PROJECT_ID.
set -euo pipefail
posthog-cli exp query run "
  SELECT event, timestamp
  FROM events
  WHERE properties.\$customer_id = '$1'
  ORDER BY timestamp DESC
  LIMIT 50"
