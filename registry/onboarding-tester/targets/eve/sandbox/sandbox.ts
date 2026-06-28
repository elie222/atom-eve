import { defineSandbox } from "eve/sandbox";
import { docker } from "eve/sandbox/docker";
import { vercel } from "eve/sandbox/vercel";

const browserSandboxBackend =
  process.env.VERCEL || process.env.VERCEL_OIDC_TOKEN
    ? vercel({ runtime: "node24", resources: { vcpus: 2 } })
    : docker();

export default defineSandbox({
  backend: browserSandboxBackend,
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: "bash setup-agent-browser.sh"
    });
  },
  async onSession({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: "bash setup-agent-browser.sh"
    });
  }
});
