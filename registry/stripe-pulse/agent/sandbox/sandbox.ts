import { defineSandbox, defaultBackend } from "eve/sandbox";

/**
 * Capability via CLI-first sandbox (the canonical pattern).
 *
 * The model's real capability is two CLIs it runs in the sandbox:
 *   - `stripe`      — revenue & churn reads (subscriptions, invoices, charges,
 *                     events). The Stripe CLI exposes the full list/filter/JSON
 *                     surface, so no hand-rolled snapshot tool is needed.
 *   - `posthog-cli` — product-engagement cross-reference via `exp query run`.
 *
 * Bootstrap runs the seeded setup script once into the template; later sessions
 * inherit the installed binaries. The usage workflow lives in the `revenue-pulse`
 * skill and `instructions.md`, not in tool code.
 *
 * Network: `defaultBackend()`'s per-session `use()` takes no options, so egress
 * is configured on the keyed backend bag. Bootstrap needs egress to fetch the
 * CLIs, so it stays open; at run time the agent reaches Stripe + PostHog + the
 * AI gateway. (Pin `vercel()` if you want per-session `onSession` policy.)
 */
const ALLOW = [
  "api.stripe.com",
  "us.posthog.com",
  "app.posthog.com",
  "github.com",
  "*.githubusercontent.com",
  "registry.npmjs.org",
  "ai-gateway.vercel.sh",
];

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: { allow: ALLOW } },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "stripe-pulse-clis-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash scripts/setup-clis.sh" });
  },
});
