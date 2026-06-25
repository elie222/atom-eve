declare module "eve/sandbox" {
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
    bootstrap?(context: SandboxBootstrapContext): Promise<void>;
    onSession?(context: SandboxSessionContext): Promise<void>;
  }

  export function defineSandbox<T extends SandboxConfig>(config: T): T;
}
