import { promises as fs } from "node:fs";
import path from "node:path";

const root = process.cwd();
const ignoredDirs = new Set([".git", "node_modules", "dist", ".next", ".turbo"]);
const suspicious = [
  /-----BEGIN (?:RSA |EC |OPENSSH |)PRIVATE KEY-----/,
  /\bsk_live_[A-Za-z0-9]{16,}\b/,
  /\bghp_[A-Za-z0-9]{30,}\b/,
  /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/
];

const hits = [];
for (const file of await walk(root)) {
  const text = await fs.readFile(file, "utf8").catch(() => "");
  for (const pattern of suspicious) {
    if (pattern.test(text)) hits.push(path.relative(root, file));
  }
}

if (hits.length) {
  console.error(`Potential secrets found:\n${[...new Set(hits)].join("\n")}`);
  process.exit(1);
}

async function walk(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory() && ignoredDirs.has(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(full)));
    else files.push(full);
  }
  return files;
}
