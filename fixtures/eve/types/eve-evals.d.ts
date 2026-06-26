declare module "eve/evals" {
  export interface EveEvalAssertionHandle {
    gate(threshold?: number): EveEvalAssertionHandle;
    soft(threshold?: number): EveEvalAssertionHandle;
    atLeast(threshold: number): EveEvalAssertionHandle;
  }

  export interface EveEvalTurn {
    message: string | null;
    expectOk(): void;
  }

  export interface EveEvalContext {
    readonly reply: string | null;
    readonly sessionId: string;
    readonly events: readonly unknown[];
    readonly signal: AbortSignal;
    send(input: string | Record<string, unknown>): Promise<EveEvalTurn>;
    succeeded(): EveEvalAssertionHandle;
    didNotFail(): EveEvalAssertionHandle;
    waiting(): EveEvalAssertionHandle;
    messageIncludes(token: string | RegExp): EveEvalAssertionHandle;
    calledTool(name: string, opts?: Record<string, unknown>): EveEvalAssertionHandle;
    notCalledTool(name: string): EveEvalAssertionHandle;
    usedNoTools(): EveEvalAssertionHandle;
    maxToolCalls(count: number): EveEvalAssertionHandle;
    noFailedActions(): EveEvalAssertionHandle;
    check(value: unknown, assertion: unknown): EveEvalAssertionHandle;
    log(message: string): void;
  }

  export interface EveEvalDefinition {
    description?: string;
    tags?: readonly string[];
    metadata?: Record<string, unknown>;
    timeoutMs?: number;
    test(t: EveEvalContext): Promise<void> | void;
  }

  export interface EveEvalConfig {
    judge?: { model: string };
    maxConcurrency?: number;
    timeoutMs?: number;
    reporters?: readonly unknown[];
  }

  export function defineEval<T extends EveEvalDefinition>(definition: T): T;
  export function defineEvalConfig<T extends EveEvalConfig>(config: T): T;
}
