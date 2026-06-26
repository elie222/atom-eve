import { defineSandbox } from "eve/sandbox";

export default defineSandbox({
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command:
        "mkdir -p reports/claim-checker/history reports/claim-checker/artifacts && bash setup-agent-browser.sh"
    });
  },
  async onSession({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: "bash setup-agent-browser.sh"
    });
  }
});
