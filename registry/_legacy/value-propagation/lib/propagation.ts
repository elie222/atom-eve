// Pure, network-free planner. Given a value that changed (oldValue -> newValue), this describes a
// read-only audit to find every stale copy of the old value across code, docs, and config, plus a
// fix plan for the operator to review. It never reads the filesystem, calls an API, or edits
// anything; it only returns a plan the agent can follow and present for approval.

export interface PropagationSearchTarget {
  area: "code" | "docs" | "config";
  description: string;
  examplePaths: string[];
}

export interface PropagationFixStep {
  order: number;
  action: string;
}

export interface ValuePropagationPlan {
  generatedAt: string;
  mode: "read_only_plan";
  oldValue: string;
  newValue: string;
  context?: string;
  searchTerms: string[];
  auditTargets: PropagationSearchTarget[];
  fixPlan: PropagationFixStep[];
  guidance: string;
}

export const planValuePropagationInputSchema = {
  type: "object",
  additionalProperties: false,
  required: ["oldValue", "newValue"],
  properties: {
    oldValue: {
      type: "string",
      description: "The stale value to find every copy of (for example the previous URL, version, price, or constant)."
    },
    newValue: {
      type: "string",
      description: "The value each confirmed stale copy should become."
    },
    context: {
      type: "string",
      description: "Optional context, such as why the value changed or where it is expected to appear."
    }
  }
} as const;

export interface PlanValuePropagationInput {
  oldValue: string;
  newValue: string;
  context?: string;
}

export function normalizePlanValuePropagationInput(input: unknown): PlanValuePropagationInput {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    throw new Error("Value propagation input must be an object with oldValue and newValue.");
  }

  const value = input as Record<string, unknown>;
  if (typeof value.oldValue !== "string" || value.oldValue.trim() === "") {
    throw new Error("oldValue must be a non-empty string.");
  }
  if (typeof value.newValue !== "string" || value.newValue.trim() === "") {
    throw new Error("newValue must be a non-empty string.");
  }
  if (value.context !== undefined && typeof value.context !== "string") {
    throw new Error("context must be a string.");
  }

  return {
    oldValue: value.oldValue,
    newValue: value.newValue,
    context: value.context as string | undefined
  };
}

export function planValuePropagation(input: PlanValuePropagationInput): ValuePropagationPlan {
  const oldValue = input.oldValue;
  const newValue = input.newValue;

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_plan",
    oldValue,
    newValue,
    context: input.context,
    searchTerms: buildSearchTerms(oldValue),
    auditTargets: buildAuditTargets(),
    fixPlan: buildFixPlan(),
    guidance:
      "This is a read-only audit and fix plan. Search for the stale value, confirm each hit is the same value (not an unrelated substring), and present a per-file diff of old -> new for operator approval. Do not edit, commit, or claim anything was changed."
  };
}

// Deterministic, pure transform: produce the distinct strings worth grepping for so the agent does
// not miss casing or whitespace variants of the same value.
function buildSearchTerms(oldValue: string): string[] {
  const trimmed = oldValue.trim();
  const candidates = [oldValue, trimmed, trimmed.toLowerCase(), trimmed.toUpperCase()];
  return candidates.filter((term, index) => term !== "" && candidates.indexOf(term) === index);
}

function buildAuditTargets(): PropagationSearchTarget[] {
  return [
    {
      area: "code",
      description:
        "Source, tests, fixtures, and inline constants where the value may be hard-coded instead of imported from one source of truth.",
      examplePaths: ["src/**", "lib/**", "app/**", "tests/**", "**/*.{ts,tsx,js,jsx,py,go,rb,java}"]
    },
    {
      area: "docs",
      description:
        "Documentation, READMEs, changelogs, and comments that quote the value and drift silently because they are not type-checked.",
      examplePaths: ["README*", "docs/**", "CHANGELOG*", "**/*.{md,mdx,txt}"]
    },
    {
      area: "config",
      description:
        "Environment files, manifests, CI, infrastructure, and package metadata where the value is duplicated for deployment.",
      examplePaths: [".env*", "**/*.{json,yaml,yml,toml,ini}", "Dockerfile*", ".github/**", "package.json"]
    }
  ];
}

function buildFixPlan(): PropagationFixStep[] {
  return [
    {
      order: 1,
      action:
        "Grep the repository for every search term across the code, docs, and config targets and collect each file and line."
    },
    {
      order: 2,
      action:
        "Triage each hit: confirm it is the same value being changed, and flag false positives or coincidental substrings to skip."
    },
    {
      order: 3,
      action:
        "Group confirmed hits by area and note whether the value should be centralized into a single shared constant or env var instead of repeated."
    },
    {
      order: 4,
      action:
        "For each confirmed hit, propose the exact old -> new edit as a reviewable diff, and call out any places that need manual judgement (formatting, encoding, or related values)."
    },
    {
      order: 5,
      action:
        "Present the full audit and proposed diffs for operator approval. Do not apply edits, commit, or report the change as done."
    }
  ];
}
