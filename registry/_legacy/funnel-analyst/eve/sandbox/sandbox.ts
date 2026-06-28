import { defineSandbox } from "eve/sandbox";

export default defineSandbox({
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: "bash setup-posthog-cli.sh"
    });
  },
  async onSession({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: "bash setup-posthog-cli.sh"
    });
  }
});
