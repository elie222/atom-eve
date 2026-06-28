import { defineSandbox, defaultBackend } from "eve/sandbox";

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
    await sandbox.run({ command: "bash setup-clis.sh" });
  },
});
