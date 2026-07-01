import type { InstallManifest, Target } from "@atom-eve/install-map";

export type Runtime = "vercel" | "node" | "cloudflare";
export type Delivery = "slack";

// Agents are authored only as eve agents. `flue` is a generated install target:
// the CLI reads the eve `agent/` source and codegens a flue `src/**` tree + a
// FLUE.md gap note. The registry schema stays eve-only.
export type CliTarget = "eve" | "flue";

export interface AtomEveConfig {
  $schema?: string;
  target: CliTarget;
  runtime?: Runtime;
  sourceRoot: string;
  registry: string;
}

export interface RemoteSkillRef {
  ref: string;
}

export interface AtomManifest extends InstallManifest {
  title?: string;
  dependencies: string[];
  targetDependencies: Partial<Record<Target, string[]>>;
  requiredEnv: string[];
  skills: RemoteSkillRef[];
}

export interface Args {
  _: string[];
  target?: CliTarget;
  runtime?: Runtime;
  sourceRoot?: string;
  workspace?: boolean;
  agent?: string;
  deliver?: Delivery;
  slack?: boolean;
  noInstall?: boolean;
}

export interface InstallOptions {
  deliver?: Delivery;
  slack?: boolean;
  noInstall?: boolean;
}
