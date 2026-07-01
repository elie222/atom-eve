import type { Target } from "@atom-eve/install-map";
import type { Args, AtomEveConfig, AtomManifest, CliTarget, Delivery, RemoteSkillRef, Runtime } from "./types.js";

export function buildConfig(target: CliTarget, args: Args): AtomEveConfig {
  return {
    $schema: "https://atomeve.dev/schema/atom-eve.json",
    target,
    runtime: args.runtime,
    sourceRoot: args.sourceRoot ?? "src",
    registry: "elie222/atom-eve"
  };
}

export function validateConfig(value: unknown): AtomEveConfig {
  if (!value || typeof value !== "object") throw new Error("Invalid atom-eve.json");
  const record = value as Record<string, unknown>;
  return {
    $schema: typeof record.$schema === "string" ? record.$schema : undefined,
    target: parseTarget(record.target),
    runtime: record.runtime === undefined ? undefined : parseRuntime(record.runtime),
    sourceRoot: typeof record.sourceRoot === "string" ? record.sourceRoot : "src",
    registry: typeof record.registry === "string" ? record.registry : "elie222/atom-eve"
  };
}

export function validateManifest(value: unknown, repoPath: string): AtomManifest {
  if (!value || typeof value !== "object") throw new Error("Invalid atom.json");
  const record = value as Record<string, unknown>;
  if (typeof record.name !== "string") throw new Error("atom.json is missing name");
  const targets = Array.isArray(record.targets) ? record.targets.map(parseManifestTarget) : [];
  if (!targets.includes("eve")) throw new Error("atom.json must declare the eve target");
  return {
    name: record.name,
    title: typeof record.title === "string" ? record.title : undefined,
    repoPath,
    targets,
    dependencies: parseStringArray(record.dependencies, "dependencies"),
    targetDependencies: parseTargetDependencies(record.targetDependencies),
    requiredEnv: parseStringArray(record.requiredEnv, "requiredEnv"),
    skills: parseSkillRefs(record.skills),
    source: parseExternalSource(record.source)
  };
}

export function parseTarget(value: unknown): CliTarget {
  const normalized = typeof value === "string" ? value.toLowerCase() : value;
  if (normalized === "eve" || normalized === "flue") return normalized;
  throw new Error(`Invalid target: ${String(value)}. Expected eve or Flue.`);
}

export function parseRuntime(value: unknown): Runtime {
  if (value === "vercel" || value === "node" || value === "cloudflare") return value;
  throw new Error(`Invalid runtime: ${String(value)}. Expected vercel, node, or cloudflare.`);
}

export function parseDelivery(value: unknown): Delivery {
  if (value === "slack") return value;
  throw new Error(`Invalid delivery: ${String(value)}. Expected slack.`);
}

export function isHelpFlag(value: unknown): boolean {
  return value === "help" || value === "--help" || value === "-h";
}

// Registry manifests are authored eve-only; this narrows a parsed CLI target to
// the registry-side `Target` and rejects anything the registry never declares.
function parseManifestTarget(value: unknown): Target {
  const target = parseTarget(value);
  if (target !== "eve") {
    throw new Error(`atom.json declares an unsupported target: ${target}`);
  }
  return target;
}

function parseStringArray(value: unknown, field: string): string[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error(`atom.json ${field} must be an array`);
  return value.map((entry) => {
    if (typeof entry !== "string" || !entry) throw new Error(`atom.json ${field} must contain strings`);
    return entry;
  });
}

function parseTargetDependencies(value: unknown): Partial<Record<Target, string[]>> {
  if (value === undefined) return {};
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("atom.json targetDependencies must be an object");
  const record = value as Record<string, unknown>;
  return {
    eve: parseStringArray(record.eve, "targetDependencies.eve")
  };
}

function parseSkillRefs(value: unknown): RemoteSkillRef[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) throw new Error("atom.json skills must be an array");
  return value.map((entry) => {
    if (!entry || typeof entry !== "object") throw new Error("Invalid skill ref");
    const record = entry as Record<string, unknown>;
    if (typeof record.ref !== "string") throw new Error("skill ref is missing 'ref'");
    return { ref: record.ref };
  });
}

function parseExternalSource(value: unknown): AtomManifest["source"] {
  if (value === undefined) return undefined;
  if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("atom.json source must be an object");
  const record = value as Record<string, unknown>;
  if (record.type !== "external-template") throw new Error("atom.json source.type must be external-template");
  if (typeof record.repo !== "string" || !/^[a-z0-9][a-z0-9._-]*\/[a-z0-9][a-z0-9._-]*$/i.test(record.repo)) {
    throw new Error("atom.json source.repo must be owner/repo");
  }
  if (typeof record.url !== "string" || !/^https?:\/\//.test(record.url)) throw new Error("atom.json source.url must be a URL");
  if (typeof record.cloneUrl !== "string" || !/^https?:\/\//.test(record.cloneUrl)) {
    throw new Error("atom.json source.cloneUrl must be a URL");
  }
  return {
    type: "external-template",
    repo: record.repo,
    url: record.url,
    cloneUrl: record.cloneUrl
  };
}
