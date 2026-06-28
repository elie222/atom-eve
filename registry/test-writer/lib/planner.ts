export type TestCategory =
  | "happy-path"
  | "edge-case"
  | "error-path"
  | "async-rejection"
  | "branch-coverage";

export interface DetectedFunction {
  name: string;
  kind: "function" | "arrow" | "method";
  isAsync: boolean;
  isExported: boolean;
  paramCount: number;
}

export interface BranchHotspot {
  kind: string;
  count: number;
}

export interface UntestedPath {
  functionName: string;
  category: TestCategory;
  reason: string;
}

export interface TestCaseDraft {
  functionName: string;
  category: TestCategory;
  title: string;
  arrange: string;
  assertion: string;
}

export interface TestPlan {
  generatedAt: string;
  mode: "read_only_draft";
  framework: string;
  source: "code" | "description";
  detectedFunctions: DetectedFunction[];
  branchHotspots: BranchHotspot[];
  untestedPaths: UntestedPath[];
  testCases: TestCaseDraft[];
  draftingHint: string;
}

export interface PlanTestsInput {
  code?: string;
  description?: string;
  framework?: string;
}

export const planTestsInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    code: {
      type: "string",
      description: "Source code of the module or function to analyze for untested paths."
    },
    description: {
      type: "string",
      description: "Plain-language description of the module's behavior, used when no code is supplied."
    },
    framework: {
      type: "string",
      description: "Test framework to scaffold for (e.g. vitest, jest, mocha, node:test). Defaults to vitest."
    }
  }
} as const;

export function normalizePlanTestsInput(input: unknown): PlanTestsInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Test plan input must be an object.");
  }

  const value = input as Record<string, unknown>;
  if (value.code !== undefined && typeof value.code !== "string") {
    throw new Error("code must be a string.");
  }
  if (value.description !== undefined && typeof value.description !== "string") {
    throw new Error("description must be a string.");
  }
  if (value.framework !== undefined && typeof value.framework !== "string") {
    throw new Error("framework must be a string.");
  }

  return {
    code: value.code as string | undefined,
    description: value.description as string | undefined,
    framework: value.framework as string | undefined
  };
}

const BRANCH_KEYWORDS: { kind: string; pattern: RegExp }[] = [
  { kind: "if/else branch", pattern: /\bif\s*\(/g },
  { kind: "switch/case", pattern: /\bcase\b/g },
  { kind: "ternary", pattern: /\?[^.:]/g },
  { kind: "try/catch", pattern: /\bcatch\s*\(/g },
  { kind: "thrown error", pattern: /\bthrow\b/g },
  { kind: "early return", pattern: /\breturn\b/g },
  { kind: "loop", pattern: /\b(for|while)\s*\(/g }
];

// Pure, network-free planner. It statically scans the code or description you paste in, surfaces
// the functions and branches that look untested, and scaffolds meaningful test cases and
// assertions. It never reads files, never runs the suite, and never writes tests; the agent
// fills in the scaffolds and presents them as drafts for operator approval.
export function planTests(input: PlanTestsInput = {}): TestPlan {
  const framework = (input.framework ?? "vitest").trim() || "vitest";
  const code = (input.code ?? "").trim();
  const description = (input.description ?? "").trim();
  const source: "code" | "description" = code.length > 0 ? "code" : "description";

  const detectedFunctions = source === "code" ? detectFunctions(code) : [];
  const branchHotspots = source === "code" ? detectBranchHotspots(code) : [];
  const hasErrorPaths = source === "code" ? /\b(throw|reject|new Error)\b/.test(code) : true;

  const untestedPaths: UntestedPath[] = [];
  const testCases: TestCaseDraft[] = [];

  if (detectedFunctions.length > 0) {
    for (const fn of detectedFunctions) {
      collectCasesForFunction(fn, hasErrorPaths, untestedPaths, testCases);
    }
  } else {
    collectCasesFromDescription(description, untestedPaths, testCases);
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    framework,
    source,
    detectedFunctions,
    branchHotspots,
    untestedPaths,
    testCases,
    draftingHint: buildDraftingHint(source, detectedFunctions.length, description)
  };
}

function detectFunctions(code: string): DetectedFunction[] {
  const found = new Map<string, DetectedFunction>();

  const add = (fn: DetectedFunction) => {
    const existing = found.get(fn.name);
    if (!existing || (fn.isExported && !existing.isExported)) {
      found.set(fn.name, fn);
    }
  };

  // function declarations: [export] [default] [async] function name(params)
  const declRe = /(export\s+)?(?:default\s+)?(async\s+)?function\s*\*?\s*([A-Za-z_$][\w$]*)\s*\(([^)]*)\)/g;
  for (const match of code.matchAll(declRe)) {
    add({
      name: match[3],
      kind: "function",
      isAsync: Boolean(match[2]),
      isExported: Boolean(match[1]),
      paramCount: countParams(match[4])
    });
  }

  // arrow / function expressions: [export] const name = [async] (params) =>  or  function (params)
  const arrowRe =
    /(export\s+)?(?:const|let|var)\s+([A-Za-z_$][\w$]*)\s*(?::[^=]+)?=\s*(async\s+)?(?:function\s*\*?\s*)?\(([^)]*)\)\s*(?::[^=]+)?=>?/g;
  for (const match of code.matchAll(arrowRe)) {
    add({
      name: match[2],
      kind: "arrow",
      isAsync: Boolean(match[3]),
      isExported: Boolean(match[1]),
      paramCount: countParams(match[4])
    });
  }

  // class methods: [async] name(params) {  (skip control-flow keywords)
  const methodRe = /(?:^|\n)\s*(?:public\s+|private\s+|protected\s+|static\s+)*(async\s+)?([A-Za-z_$][\w$]*)\s*\(([^)]*)\)\s*(?::[^{]+)?\{/g;
  const reserved = new Set(["if", "for", "while", "switch", "catch", "function", "return", "constructor"]);
  for (const match of code.matchAll(methodRe)) {
    const name = match[2];
    if (reserved.has(name) || found.has(name)) continue;
    add({
      name,
      kind: "method",
      isAsync: Boolean(match[1]),
      isExported: false,
      paramCount: countParams(match[3])
    });
  }

  return [...found.values()];
}

function countParams(raw: string): number {
  const trimmed = raw.trim();
  if (!trimmed) return 0;
  return trimmed.split(",").filter((part) => part.trim().length > 0).length;
}

function detectBranchHotspots(code: string): BranchHotspot[] {
  return BRANCH_KEYWORDS.map(({ kind, pattern }) => ({
    kind,
    count: (code.match(pattern) ?? []).length
  })).filter((hotspot) => hotspot.count > 0);
}

function collectCasesForFunction(
  fn: DetectedFunction,
  hasErrorPaths: boolean,
  untestedPaths: UntestedPath[],
  testCases: TestCaseDraft[]
): void {
  const call = `${fn.isAsync ? "await " : ""}${fn.name}(${sampleArgs(fn.paramCount)})`;

  untestedPaths.push({
    functionName: fn.name,
    category: "happy-path",
    reason: `${fn.name} has no test covering a typical, valid call.`
  });
  testCases.push({
    functionName: fn.name,
    category: "happy-path",
    title: `${fn.name} returns the expected result for valid input`,
    arrange: `// arrange valid inputs for ${fn.name}`,
    assertion: `const result = ${call};\nexpect(result).toEqual(/* expected output */);`
  });

  if (fn.paramCount > 0) {
    untestedPaths.push({
      functionName: fn.name,
      category: "edge-case",
      reason: `${fn.name} takes input but boundary/empty values look uncovered.`
    });
    testCases.push({
      functionName: fn.name,
      category: "edge-case",
      title: `${fn.name} handles empty or boundary input`,
      arrange: `// arrange empty / min / max / null-ish inputs`,
      assertion: `const result = ${fn.isAsync ? "await " : ""}${fn.name}(${edgeArgs(fn.paramCount)});\nexpect(result).toEqual(/* expected boundary output */);`
    });
  }

  if (hasErrorPaths) {
    const category: TestCategory = fn.isAsync ? "async-rejection" : "error-path";
    untestedPaths.push({
      functionName: fn.name,
      category,
      reason: `${fn.name} can fail or throw, but the failure path looks uncovered.`
    });
    testCases.push({
      functionName: fn.name,
      category,
      title: `${fn.name} ${fn.isAsync ? "rejects" : "throws"} on invalid input`,
      arrange: `// arrange invalid inputs that should fail`,
      assertion: fn.isAsync
        ? `await expect(${fn.name}(/* invalid */)).rejects.toThrow();`
        : `expect(() => ${fn.name}(/* invalid */)).toThrow();`
    });
  }
}

function collectCasesFromDescription(
  description: string,
  untestedPaths: UntestedPath[],
  testCases: TestCaseDraft[]
): void {
  const subject = description.length > 0 ? "the described behavior" : "the module";
  const cases: { category: TestCategory; title: string; assertion: string }[] = [
    {
      category: "happy-path",
      title: `${subject} works for a typical, valid scenario`,
      assertion: `expect(/* result */).toEqual(/* expected output */);`
    },
    {
      category: "edge-case",
      title: `${subject} handles empty, boundary, and unusual inputs`,
      assertion: `expect(/* boundary result */).toEqual(/* expected output */);`
    },
    {
      category: "error-path",
      title: `${subject} surfaces a clear error on invalid input`,
      assertion: `expect(() => /* call */).toThrow();`
    }
  ];

  for (const item of cases) {
    untestedPaths.push({
      functionName: "(from description)",
      category: item.category,
      reason: `No code was provided; ${item.category} is inferred from the description.`
    });
    testCases.push({
      functionName: "(from description)",
      category: item.category,
      title: item.title,
      arrange: `// arrange inputs for: ${item.category}`,
      assertion: item.assertion
    });
  }
}

function sampleArgs(count: number): string {
  if (count === 0) return "";
  return Array.from({ length: count }, (_, index) => `arg${index + 1}`).join(", ");
}

function edgeArgs(count: number): string {
  if (count === 0) return "";
  return Array.from({ length: count }, () => "/* empty */").join(", ");
}

function buildDraftingHint(
  source: "code" | "description",
  functionCount: number,
  description: string
): string {
  if (source === "description" && description.length === 0) {
    return "No code or description was provided. Ask for the source code (or at least a behavior description) before drafting tests.";
  }
  if (source === "description") {
    return "No code was provided, so these cases are inferred from the description. Ask for the actual source to pin down concrete inputs and assertions, then present every test as a draft for operator approval. Do not write test files.";
  }
  return `Detected ${functionCount} function(s). Fill in the concrete inputs and expected outputs for each scaffold, prioritizing the highest-risk untested paths (error handling and branches) first. Present every test as a draft for operator approval; do not write test files or run the suite without sign-off.`;
}
