import { defineSandbox, defaultBackend } from "eve/sandbox";

/**
 * Capability via CLI-first sandbox: the model's real capability is Agent Browser
 * (`agent-browser`), a real browser it drives in the sandbox with `bash`. There
 * is no hand-rolled browser wrapper tool; the LLM follows the open -> snapshot ->
 * act -> screenshot loop itself.
 *
 * Bootstrap installs `agent-browser` + a Chromium runtime once into the template;
 * later sessions inherit it. QA targets arbitrary sites, so egress stays open.
 */
export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: "allow-all" },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "website-qa-agent-browser-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash scripts/setup-agent-browser.sh" });
  },
});
