declare module "eve/evals/expect" {
  export interface EveValueAssertion {
    readonly kind: string;
  }

  export function includes(substring: string): EveValueAssertion;
  export function equals(value: unknown): EveValueAssertion;
  export function matches(schema: unknown): EveValueAssertion;
  export function similarity(expected: string): EveValueAssertion;
}
