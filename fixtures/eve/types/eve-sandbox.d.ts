declare module "eve/sandbox" {
  interface SandboxBackend {
    readonly name?: string;
  }

  interface SandboxSession {
    run(options: { command: string }): Promise<{ stdout?: string; stderr?: string; exitCode?: number }>;
  }

  interface SandboxBootstrapContext {
    use(): Promise<SandboxSession>;
  }

  interface SandboxSessionContext {
    use(): Promise<SandboxSession>;
  }

  interface SandboxConfig {
    backend?: SandboxBackend;
    bootstrap?(context: SandboxBootstrapContext): Promise<void>;
    onSession?(context: SandboxSessionContext): Promise<void>;
  }

  export function defineSandbox<T extends SandboxConfig>(config: T): T;
}

declare module "eve/sandbox/docker" {
  import type { SandboxBackend } from "eve/sandbox";

  export function docker(options?: Record<string, unknown>): SandboxBackend;
}

declare module "eve/sandbox/vercel" {
  import type { SandboxBackend } from "eve/sandbox";

  export function vercel(options?: Record<string, unknown>): SandboxBackend;
}
