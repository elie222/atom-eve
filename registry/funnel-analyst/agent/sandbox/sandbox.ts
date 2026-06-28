import { defineSandbox, defaultBackend } from "eve/sandbox";

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
  revalidationKey: () => "funnel-analyst-posthog-cli-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-posthog-cli.sh" });
  },
});
