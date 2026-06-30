import { defineSandbox, defaultBackend } from "eve/sandbox";

const ALLOW = [
  "github.com",
  "*.github.com",
  "objects.githubusercontent.com",
  "raw.githubusercontent.com",
  "api.github.com",
  "ai-gateway.vercel.sh",
];

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: { allow: ALLOW } },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "docs-sync-gh-cli-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-gh.sh" });
  },
});
