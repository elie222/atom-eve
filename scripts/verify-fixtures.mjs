import { spawnSync } from "node:child_process";
import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const cli = path.join(root, "packages", "cli", "dist", "index.js");
const agent = path.join(root, "registry", "facebook-ads");

for (const target of ["eve", "flue"]) {
  const fixture = path.join(root, "fixtures", target);
  const temp = path.join(root, "fixtures", `.tmp-${target}-facebook-ads`);
  await fs.rm(temp, { recursive: true, force: true });
  await fs.cp(fixture, temp, { recursive: true });

  run("node", [cli, "init", "--target", target, ...(target === "flue" ? ["--runtime", "cloudflare"] : [])], temp);
  run("node", [cli, "add", agent, "--target", target], temp);
  run("pnpm", ["exec", "tsc", "-p", path.join(temp, "tsconfig.json"), "--noEmit"], root);

  await fs.rm(temp, { recursive: true, force: true });
}

function run(command, args, cwd) {
  const result = spawnSync(command, args, { cwd, stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(" ")} failed with exit code ${result.status}`);
  }
}
