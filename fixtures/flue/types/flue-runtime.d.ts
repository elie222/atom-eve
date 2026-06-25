declare module "@flue/runtime" {
  export function defineAgent<T>(config: () => T): () => T;
  export function defineWorkflow<T>(config: T): T;
}
