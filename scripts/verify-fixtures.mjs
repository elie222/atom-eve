import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

// Keep fixture installs hermetic: never reach out to skills.sh for remote skills.
process.env.ATOM_EVE_SKIP_REMOTE_SKILLS = "1";

const root = process.cwd();
const cli = path.join(root, "packages", "cli", "dist", "index.js");
const index = JSON.parse(await fs.readFile(path.join(root, "public", "index.json"), "utf8"));

// Agents are authored eve-only (item.targets === ["eve"]), but flue is a
// GENERATED target: for every agent we also generate its flue version, install
// it into fixtures/flue, and typecheck the generated `src/**` against the real
// `@flue/runtime`. FLUE.md is a doc-only gap note and is not typechecked.
for (const item of index.items) {
  const agent = path.join(root, item.repoPath);
  for (const target of [...item.targets, "flue"]) {
    const fixture = path.join(root, "fixtures", target);
    const temp = path.join(root, "fixtures", `.tmp-${target}-${item.name}`);
    await fs.rm(temp, { recursive: true, force: true });
    await fs.cp(fixture, temp, { recursive: true });

    run("node", [cli, "init", "--target", target], temp);
    run("node", [cli, "add", agent, "--target", target], temp);
    run("pnpm", ["exec", "tsc", "-p", path.join(temp, "tsconfig.json"), "--noEmit"], root);

    await fs.rm(temp, { recursive: true, force: true });
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}
