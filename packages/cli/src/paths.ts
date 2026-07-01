import fsSync from "node:fs";
import path from "node:path";

// Fixed at process load; every command operates relative to the launch directory.
export const cwd = process.cwd();

export function toPosixPath(filePath: string): string {
  return filePath.split(path.sep).join(path.posix.sep);
}

export function findRegistryRoot(agentDir: string): string {
  let current = agentDir;
  while (current !== path.dirname(current)) {
    if (path.basename(path.dirname(current)) === "registry") return path.dirname(path.dirname(current));
    current = path.dirname(current);
  }
  return path.dirname(path.dirname(agentDir));
}

export function findUp(start: string, name: string): string | undefined {
  let current = start;
  while (current !== path.dirname(current)) {
    const candidate = path.join(current, name);
    try {
      fsSync.statSync(candidate);
      return candidate;
    } catch {
      current = path.dirname(current);
    }
  }
  return undefined;
}
