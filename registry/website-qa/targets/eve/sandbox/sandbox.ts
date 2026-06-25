import { defineSandbox } from "eve/sandbox";

export default defineSandbox({
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: [
        "set -e",
        "mkdir -p reports/assets",
        "npm init -y >/dev/null",
        "npm install agent-browser@latest",
        "npx agent-browser install"
      ].join(" && ")
    });
  }
});
