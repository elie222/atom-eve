import { defineSandbox, defaultBackend } from "eve/sandbox";

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: "allow-all" },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "seo-audit-agent-browser-v2",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-agent-browser.sh" });
  },
  async onSession({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-agent-browser.sh" });
  },
});
