import { defineSandbox, defaultBackend } from "eve/sandbox";

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: "allow-all" },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "backlink-prospector-agent-browser-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash setup-agent-browser.sh" });
  },
});
