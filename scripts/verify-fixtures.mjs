import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

// Keep fixture installs hermetic: never reach out to skills.sh for remote skills,
// and never send install telemetry for fixture runs.
process.env.ATOM_EVE_SKIP_REMOTE_SKILLS = "1";
process.env.ATOM_EVE_DISABLE_TELEMETRY = "1";

const root = process.cwd();
const cli = path.join(root, "packages", "cli", "dist", "index.js");
const index = JSON.parse(await fs.readFile(path.join(root, "public", "index.json"), "utf8"));

const defaultTargetItem = index.items[0];
if (defaultTargetItem) {
  const agent = path.join(root, defaultTargetItem.repoPath);
  const temp = path.join(root, "fixtures", `.tmp-default-target-${defaultTargetItem.name}`);
  await fs.rm(temp, { recursive: true, force: true });
  await fs.mkdir(temp, { recursive: true });

  run("node", [cli, "add", agent], temp);
  await assertDefaultEveProject(temp);

  await fs.rm(temp, { recursive: true, force: true });
}

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
    // An agent may ship no TypeScript at all (no custom tools, schedules, or
    // channels, and no agent.ts since it only re-pinned the default model). tsc
    // errors on an empty input set, so only typecheck when there is code.
    if (await hasTypeScript(temp)) {
      run("pnpm", ["exec", "tsc", "-p", path.join(temp, "tsconfig.json"), "--noEmit"], root);
    } else {
      console.log(`(no TypeScript to typecheck for ${target}/${item.name})`);
    }

    await fs.rm(temp, { recursive: true, force: true });
  }
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}

async function hasTypeScript(dir) {
  const entries = await fs.readdir(dir, { recursive: true, withFileTypes: true });
  return entries.some((entry) => entry.isFile() && entry.name.endsWith(".ts"));
}

async function assertDefaultEveProject(dir) {
  const config = JSON.parse(await fs.readFile(path.join(dir, "atom-eve.json"), "utf8"));
  if (config.target !== "eve") {
    throw new Error(`Expected default target eve, got ${String(config.target)}`);
  }

  await fs.access(path.join(dir, "package.json"));
  await fs.access(path.join(dir, "tsconfig.json"));
  await fs.access(path.join(dir, "agent", "instructions.md"));
}
