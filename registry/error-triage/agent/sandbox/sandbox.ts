import { defineSandbox, defaultBackend } from "eve/sandbox";

const ALLOW = [
  "sentry.io",
  "*.sentry.io",
  "cli.sentry.dev",
  "github.com",
  "*.githubusercontent.com",
  "ai-gateway.vercel.sh",
];

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: { allow: ALLOW } },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "error-triage-sentry-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-sentry.sh" });
  },
});
