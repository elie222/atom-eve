import { defineSandbox, defaultBackend } from "eve/sandbox";

const ALLOW = [
  "api.stripe.com",
  "github.com",
  "objects.githubusercontent.com",
  "ai-gateway.vercel.sh",
];

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: { allow: ALLOW } },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "dunning-stripe-cli-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-stripe.sh" });
  },
});
