import { defineSandbox, defaultBackend } from "eve/sandbox";

/**
 * Capability via CLI-first sandbox: the model's real capability is the GitHub CLI
 * (`gh`) it runs in the sandbox with `bash` to read open pull requests and their
 * diffs. There is no hand-rolled GitHub REST client; `gh` exposes the full read
 * surface and reads `GH_TOKEN`/`GITHUB_TOKEN` from the environment.
 *
 * Bootstrap installs `gh` once into the template; later sessions inherit it.
 * Bootstrap needs egress to fetch the release tarball, and at run time the agent
 * reaches GitHub plus the AI gateway, so those hosts stay on the allow-list.
 */
const ALLOW = ["github.com", "*.github.com", "objects.githubusercontent.com", "ai-gateway.vercel.sh"];

export default defineSandbox({
  backend: defaultBackend({
    vercel: { networkPolicy: { allow: ALLOW } },
    docker: { networkPolicy: "allow-all" },
  }),
  revalidationKey: () => "adversarial-reviewer-gh-cli-v1",
  async bootstrap({ use }) {
    const sandbox = await use();
    await sandbox.run({ command: "bash scripts/setup-gh.sh" });
  },
});
