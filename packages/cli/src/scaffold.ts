import fsSync from "node:fs";
import { promises as fs } from "node:fs";
import path from "node:path";
import { validateConfig } from "./manifest.js";
import { cwd } from "./paths.js";
import type { AtomEveConfig, CliTarget } from "./types.js";

export async function writeConfig(dir: string, config: AtomEveConfig) {
  validateConfig(config);
  const outPath = path.join(dir, "atom-eve.json");
  await fs.writeFile(outPath, `${JSON.stringify(config, null, 2)}\n`);
  console.log(`Created ${path.relative(cwd, outPath) || "atom-eve.json"}`);
}

export async function writeIfMissingAt(filePath: string, content: string) {
  if (fsSync.existsSync(filePath)) {
    console.log(`Skipped existing ${path.relative(cwd, filePath) || filePath}`);
    return;
  }
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, content);
  console.log(`Created ${path.relative(cwd, filePath) || filePath}`);
}

export async function scaffoldProject(target: CliTarget) {
  if (target === "flue") {
    await scaffoldFlueProject();
    return;
  }
  if (target !== "eve") return;

  await writeIfMissing(
    "package.json",
    `${JSON.stringify(
      {
        name: path.basename(cwd),
        version: "0.0.0",
        private: true,
        type: "module",
        packageManager: "pnpm@10.26.2",
        scripts: {
          build: "eve build",
          dev: "eve dev",
          start: "eve start",
          typecheck: "tsc"
        },
        dependencies: {
          ai: "^7.0.0",
          eve: "^0.16.2"
        },
        devDependencies: {
          "@types/node": "24.x",
          typescript: "7.0.1-rc"
        },
        engines: {
          node: "24.x"
        }
      },
      null,
      2
    )}\n`
  );

  await writeIfMissing(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          strict: true,
          skipLibCheck: true,
          types: ["node"],
          noEmit: true
        },
        include: ["agent/**/*.ts", "evals/**/*.ts"]
      },
      null,
      2
    )}\n`
  );
}

// allowImportingTsExtensions lets app.ts import ./workflows/*.ts; the ambient
// *.md / *.skill.md types ship in @flue/runtime.
async function scaffoldFlueProject() {
  await writeIfMissing(
    "package.json",
    `${JSON.stringify(
      {
        name: path.basename(cwd),
        version: "0.0.0",
        private: true,
        type: "module",
        scripts: {
          typecheck: "tsc --noEmit"
        },
        dependencies: {
          "@flue/runtime": "1.0.0-beta.7"
        },
        devDependencies: {
          "@types/node": "24.x",
          typescript: "^5.7.3"
        },
        engines: {
          node: ">=22.19.0"
        }
      },
      null,
      2
    )}\n`
  );

  await writeIfMissing(
    "tsconfig.json",
    `${JSON.stringify(
      {
        compilerOptions: {
          target: "ES2022",
          module: "NodeNext",
          moduleResolution: "NodeNext",
          types: ["node"],
          strict: true,
          esModuleInterop: true,
          skipLibCheck: true,
          allowImportingTsExtensions: true,
          noEmit: true,
          resolveJsonModule: true
        },
        include: ["src/**/*.ts"]
      },
      null,
      2
    )}\n`
  );
}

async function writeIfMissing(relativePath: string, content: string) {
  await writeIfMissingAt(path.join(cwd, relativePath), content);
}
