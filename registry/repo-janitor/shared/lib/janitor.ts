export type CleanupFocus = "stale_files" | "dead_code" | "lint_debt" | "all";

export interface CleanupCandidate {
  path: string;
  category: "stale_file";
  confidence: "proven_low_risk";
  rationale: string;
  verifyBeforeRemoving: string;
}

export interface DeferredItem {
  path: string;
  reason: string;
}

export interface CleanupCheck {
  focus: Exclude<CleanupFocus, "all">;
  step: string;
  readOnly: true;
}

export interface CleanupPlan {
  generatedAt: string;
  mode: "read_only_draft";
  focus: CleanupFocus;
  repoDescription: string | null;
  proposedCleanups: CleanupCandidate[];
  deferred: DeferredItem[];
  suggestedChecks: CleanupCheck[];
  oneAtATimeHint: string;
  draftingHint: string;
}

export const planRepoCleanupInputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    files: {
      type: "array",
      items: { type: "string" },
      description: "Optional list of repository file paths to classify into cleanup candidates."
    },
    repoDescription: {
      type: "string",
      description: "Optional short description of the repo to ground the cleanup focus."
    },
    focus: {
      type: "string",
      enum: ["stale_files", "dead_code", "lint_debt", "all"],
      description: "Which cleanup area to plan checks for. Defaults to all."
    }
  }
} as const;

export interface PlanRepoCleanupInput {
  files?: string[];
  repoDescription?: string;
  focus?: CleanupFocus;
}

const FOCUS_VALUES: CleanupFocus[] = ["stale_files", "dead_code", "lint_debt", "all"];

export function normalizePlanRepoCleanupInput(input: unknown): PlanRepoCleanupInput {
  if (input === undefined || input === null) return {};
  if (typeof input !== "object" || Array.isArray(input)) {
    throw new Error("Repo cleanup plan input must be an object.");
  }

  const value = input as Record<string, unknown>;

  let files: string[] | undefined;
  if (value.files !== undefined) {
    if (!Array.isArray(value.files) || value.files.some((item) => typeof item !== "string")) {
      throw new Error("files must be an array of strings.");
    }
    files = value.files as string[];
  }

  if (value.repoDescription !== undefined && typeof value.repoDescription !== "string") {
    throw new Error("repoDescription must be a string.");
  }

  if (value.focus !== undefined && !FOCUS_VALUES.includes(value.focus as CleanupFocus)) {
    throw new Error("focus must be one of stale_files, dead_code, lint_debt, all.");
  }

  return {
    files,
    repoDescription: value.repoDescription as string | undefined,
    focus: value.focus as CleanupFocus | undefined
  };
}

// Pure, network-free planner. It never reads the filesystem, calls an API, or changes anything. It
// classifies the file paths the operator hands it into proven low-risk cleanups versus work that is
// too uncertain to touch, and returns a read-only checklist for the agent to draft against.
export function planRepoCleanup(input: PlanRepoCleanupInput = {}): CleanupPlan {
  const focus = input.focus ?? "all";
  const files = input.files ?? [];

  const proposedCleanups: CleanupCandidate[] = [];
  const deferred: DeferredItem[] = [];

  for (const path of files) {
    const stale = matchStaleArtifact(path);
    if (stale) {
      proposedCleanups.push({
        path,
        category: "stale_file",
        confidence: "proven_low_risk",
        rationale: stale,
        verifyBeforeRemoving:
          "Confirm the file is not referenced by any build, import, or config before proposing removal."
      });
      continue;
    }

    const uncertain = matchUncertainSource(path);
    if (uncertain) {
      deferred.push({ path, reason: uncertain });
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    mode: "read_only_draft",
    focus,
    repoDescription: input.repoDescription ?? null,
    proposedCleanups,
    deferred,
    suggestedChecks: suggestChecks(focus),
    oneAtATimeHint:
      "Surface one proposed cleanup at a time for operator approval. Do not batch removals or claim anything was deleted or fixed.",
    draftingHint:
      "Draft each proposed cleanup as a reviewable change description with its rationale and verification step. Leave every deferred item alone until references are provably zero."
  };
}

function matchStaleArtifact(path: string): string | null {
  const name = path.split("/").pop() ?? path;

  if (/\.(bak|old|orig|tmp|swp|swo|rej)$/i.test(name)) {
    return "Matches a known throwaway artifact extension (backup, temp, swap, or merge reject file).";
  }
  if (/~$/.test(name)) {
    return "Trailing-tilde editor backup file.";
  }
  if (/\.log$/i.test(name)) {
    return "Log file that does not belong in version control.";
  }
  if (/^\.DS_Store$/.test(name) || /^Thumbs\.db$/i.test(name)) {
    return "OS-generated metadata file that should not be committed.";
  }
  if (/[-_.](old|bak|backup|copy|deprecated)\b/i.test(name) && !isSourceFile(name)) {
    return "Filename is explicitly marked as an old, backup, or copied artifact.";
  }
  return null;
}

function matchUncertainSource(path: string): string | null {
  const name = path.split("/").pop() ?? path;
  if (!isSourceFile(name)) return null;

  if (/[-_.](old|legacy|deprecated|unused|copy|v\d+)\b/i.test(name)) {
    return "Source file name hints it may be removable, but it could still be imported. Leave it alone until a zero-reference check proves it is dead.";
  }
  return null;
}

function isSourceFile(name: string): boolean {
  return /\.(ts|tsx|js|jsx|mjs|cjs|py|rb|go|rs|java|kt|c|h|cpp|cs|php|swift)$/i.test(name);
}

function suggestChecks(focus: CleanupFocus): CleanupCheck[] {
  const all: CleanupCheck[] = [
    {
      focus: "stale_files",
      step: "List files matching throwaway patterns (.bak, .old, .tmp, .log, .DS_Store, ~) and propose removing only those proven not to be referenced.",
      readOnly: true
    },
    {
      focus: "dead_code",
      step: "Use the language's own tooling to find exports and files with zero references. Propose removal only when references are provably zero; otherwise leave the code alone.",
      readOnly: true
    },
    {
      focus: "lint_debt",
      step: "Run the linter in report-only mode and group violations. Propose the safe auto-fixable set first; flag rule changes and risky fixes for operator review rather than applying them.",
      readOnly: true
    }
  ];

  if (focus === "all") return all;
  return all.filter((check) => check.focus === focus);
}
