#!/usr/bin/env bash
# Seeds the sandbox with the two CLIs the agent reasons over:
#   - stripe   : revenue & churn reads (subscriptions, invoices, charges, events)
#   - posthog-cli : product-engagement cross-reference (HogQL via `exp query run`)
#
# Run once from sandbox bootstrap (template-scoped). Idempotent: skips installs
# that are already on PATH so template rebuilds stay cheap.
set -euo pipefail

if ! command -v stripe >/dev/null 2>&1; then
  # Stripe CLI: pinned tarball, no apt repo needed on the eve base image.
  STRIPE_VERSION="1.30.0"
  ARCH="$(uname -m)"
  case "$ARCH" in
    x86_64) STRIPE_ARCH="linux_x86_64" ;;
    aarch64 | arm64) STRIPE_ARCH="linux_arm64" ;;
    *) echo "unsupported arch for stripe CLI: $ARCH" >&2; exit 1 ;;
  esac
  curl -fsSL \
    "https://github.com/stripe/stripe-cli/releases/download/v${STRIPE_VERSION}/stripe_${STRIPE_VERSION}_${STRIPE_ARCH}.tar.gz" \
    -o /tmp/stripe.tar.gz
  tar -xzf /tmp/stripe.tar.gz -C /usr/local/bin stripe
  rm -f /tmp/stripe.tar.gz
fi

if ! command -v posthog-cli >/dev/null 2>&1; then
  # posthog-cli is the npm package @posthog/cli (a Rust binary), NOT pip.
  npm install -g @posthog/cli >/dev/null 2>&1
fi

stripe version || true
posthog-cli --version || true
