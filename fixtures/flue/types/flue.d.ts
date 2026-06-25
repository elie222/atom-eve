declare module "flue" {
  export function createAgent<T>(config: T): T;
  export function createWorkflow<T>(config: T): T;
}
