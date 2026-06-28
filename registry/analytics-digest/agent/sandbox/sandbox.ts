import { defineSandbox, defaultBackend } from "eve/sandbox";

/**
 * Capability via CLI-first sandbox: the model's real capability is the
 * `posthog-cli` it runs in the sandbox with `bash` (discover -> info -> call).
 * No hand-rolled REST client; the CLI exposes PostHog's full read surface.
 *
 * Bootstrap installs the CLI once into the template; later sessions inherit it.
 * Bootstrap needs egress to fetch the CLI from npm, and at run time the agent
 * reaches PostHog plus the AI gateway, so those hosts stay on the allow-list.
 */
const ALLOW = [
  "us.posthog.com",
  "eu.posthog.com",
  "app.posthog.com",
  "registry.npmjs.org",
  "ai-gateway.vercel.sh",
];

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: { allow: ALLOW } },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "analytics-digest-posthog-cli-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash scripts/setup-posthog-cli.sh" });
  },
});
