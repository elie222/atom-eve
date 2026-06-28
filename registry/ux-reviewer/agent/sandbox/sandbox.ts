import { defineSandbox, defaultBackend } from "eve/sandbox";

/**
 * Capability via CLI-first sandbox: the model's real capability is Agent Browser
 * (`agent-browser`), a real browser it drives in the sandbox with `bash`. There
 * is no hand-rolled browser wrapper tool and no deterministic scoring code; the
 * LLM walks the task screen by screen and forms the usability judgment itself.
 *
 * Bootstrap installs `agent-browser` + a Chromium runtime once into the template
 * and seeds the screenshot directory; later sessions inherit it. Reviews target
 * arbitrary apps, so egress stays open.
 */
export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: "allow-all" },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "ux-reviewer-agent-browser-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash scripts/setup-agent-browser.sh" });
  },
});
