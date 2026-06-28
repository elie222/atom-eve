import { defineSandbox } from "eve/sandbox";

export default defineSandbox({
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({
      command: "mkdir -p reports/seo-audit/history reports/seo-audit/assets"
    });
  }
});
